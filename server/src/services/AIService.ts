import axios from 'axios';
import { Block } from '../models/page';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AIServiceConfig {
  apiKey?: string;
  apiEndpoint?: string;
}

interface ScheduleEntry {
  time: string;
  activity: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  assignee?: string;
}

class AIService {
  private config: AIServiceConfig;
  private apiClient: any;

  constructor(config: AIServiceConfig = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    this.config = {
      apiKey,
      apiEndpoint: 'https://openrouter.ai/api/v1',
      ...config
    };

    this.apiClient = axios.create({
      baseURL: this.config.apiEndpoint,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Mentor App'
      }
    });
  }

  /**
   * Generate blocks based on user prompt
   * @param prompt User's input prompt
   * @returns Generated blocks
   */
  async generateBlocks(prompt: string): Promise<Block[]> {
    try {
      // Create a system prompt that instructs the AI to only output the requested blocks in the exact format specified
      const systemPrompt = `You are an expert content structuring AI assistant. ONLY output the requested blocks in the exact format specified. DO NOT add any explanations or comments.

BLOCK TYPES AND EXACT SYNTAX:

1. Headings (MUST start with # and a single space):
   # Main Topic
   ## Subtopic
   ### Detailed Topic

2. Toggle Lists (MUST start with > and a single space):
   > Toggle Section Title
   [ ] Task within toggle
   Another line within toggle
   ## Subheading within toggle

3. Todo Lists (MUST start with [ ] with NO bullet points or dashes):
   [ ] Pending task

4. Tables (MUST use | for columns and - for header separator):
   | Header 1 | Header 2 | Header 3 |
   |----------|----------|----------|
   | Cell 1   | Cell 2   | Cell 3   |

5. Schedule (MUST use @schedule and follow JSON format):
   @schedule
   {
     "entries": [
       {
         "time": "09:00",
         "activity": "Team Meeting",
         "status": "Not Started",
         "priority": "High",
         "assignee": "John"
       },
       {
         "time": "10:30",
         "activity": "Code Review",
         "status": "In Progress",
         "priority": "Medium",
         "assignee": "Sarah"
       }
     ]
   }

STRICT FORMATTING RULES:
- Todo items MUST start directly with [ ]
- NEVER use bullet points or dashes (except for table separators)
- Add blank lines between different blocks
- Indent toggle content with 2 spaces
- Tables MUST have header row and separator
- For tables, header and separator rows DO NOT count towards the requested row count
- When user requests X rows and Y columns, create EXACTLY that number (header row doesn't count)
- Schedule entries MUST be valid JSON with required fields: time, activity, status, priority
- Schedule status MUST be one of: "Not Started", "In Progress", "Completed"
- Schedule priority MUST be one of: "Low", "Medium", "High"
- ALWAYS follow the exact syntax shown above
- DO NOT add any explanations or text outside of the block formats
- ONLY output the requested blocks

EXAMPLES:

For "add todo read book":
[ ] read book

For "create study plan":
# Study Plan
## Key Topics
[ ] Review chapter 1
> Practice Exercises
  [ ] Complete worksheet 1
  [ ] Review answers

For "create schedule":
@schedule
{
  "entries": [
    {
      "time": "09:00",
      "activity": "Team Meeting",
      "status": "Not Started",
      "priority": "High",
      "assignee": "John"
    },
    {
      "time": "14:00",
      "activity": "Client Call",
      "status": "Not Started",
      "priority": "Medium",
      "assignee": "Sarah"
    }
  ]
}

For "create table with 2 rows and 3 columns":
| Col 1 | Col 2 | Col 3 |
|-------|-------|-------|
| A     | B     | C     |`;

      // Send request to OpenRouter API
      const response = await this.apiClient.post('/chat/completions', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'neversleep/llama-3-lumimaid-8b:extended',
        temperature: 0.7
      });

      // Process the AI response into blocks
      const aiResponse = response.data.choices[0].message.content;
      return this.processAIResponse(aiResponse);
    } catch (error) {
      console.error('Error generating blocks:', error);
      throw error;
    }
  }

  /**
   * Process the AI response and convert it to blocks
   * @param aiResponse Raw AI response from OpenRouter
   * @returns Processed blocks
   */
  private processAIResponse(aiResponse: string): Block[] {
    const blocks: Block[] = [];
    const lines = aiResponse.split('\n');
    let currentToggle: Block | null = null;
    let toggleBlocks: Block[] = [];
    let currentTable: Block | null = null;
    let tableRows: { id: string; cells: { id: string; content: string; }[]; }[] = [];
    let currentSchedule: string[] = [];
    let isCollectingSchedule = false;
    
    const createBlock = (type: Block['type'], content: string, extras: Partial<Block> = {}): Block => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      type,
      content,
      ...extras
    });

    const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');
    const isTableSeparator = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|') && line.includes('-');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle schedule blocks
      if (trimmedLine === '@schedule') {
        isCollectingSchedule = true;
        currentSchedule = [];
        continue;
      }

      if (isCollectingSchedule) {
        // Only collect lines that could be part of valid JSON
        if (trimmedLine.match(/^[{}\[\],":\s\d\w@-]+$/)) {
          currentSchedule.push(trimmedLine);
        } else {
          // If we encounter an invalid line, stop collecting schedule
          isCollectingSchedule = false;
          currentSchedule = [];
        }

        // Try to process schedule when we hit a non-JSON line or end of input
        if (i === lines.length - 1 || !trimmedLine.match(/^[{}\[\],":\s\d\w@-]+$/)) {
          try {
            const scheduleJson = currentSchedule.join('');
            // Validate JSON structure before parsing
            if (scheduleJson.includes('"entries"') && scheduleJson.trim().startsWith('{') && scheduleJson.trim().endsWith('}')) {
              const scheduleData = JSON.parse(scheduleJson);
              
              // Validate entries structure
              if (Array.isArray(scheduleData.entries) && scheduleData.entries.length > 0) {
                // Validate and sanitize each entry
                const validEntries = scheduleData.entries
                  .filter((entry: unknown): entry is ScheduleEntry => {
                    return entry !== null &&
                           typeof (entry as any).time === 'string' && 
                           typeof (entry as any).activity === 'string' &&
                           ['Not Started', 'In Progress', 'Completed'].includes((entry as any).status) &&
                           ['Low', 'Medium', 'High'].includes((entry as any).priority);
                  })
                  .map((entry: ScheduleEntry) => ({
                    ...entry,
                    time: entry.time.trim(),
                    activity: entry.activity.trim(),
                    status: entry.status.trim() as ScheduleEntry['status'],
                    priority: entry.priority.trim() as ScheduleEntry['priority'],
                    assignee: entry.assignee ? entry.assignee.trim() : undefined
                  }));

                if (validEntries.length > 0) {
                  // Format entries to match ScheduleBlock's expected structure
                  const formattedEntries = validEntries.map((entry: ScheduleEntry) => ({
                    id: Date.now().toString() + Math.random().toString(36).substring(2),
                    time: entry.time,
                    activity: entry.activity,
                    status: entry.status,
                    priority: entry.priority,
                    assignee: entry.assignee
                  }));

                  blocks.push(createBlock('schedule', JSON.stringify(formattedEntries)));
                }
              }
            }
          } catch (error) {
            console.error('Error parsing schedule JSON:', error);
          }
          isCollectingSchedule = false;
          currentSchedule = [];
        }
        continue;
      }

      // Remove duplicate schedule processing code
      if (!trimmedLine) {
        // Handle existing blocks before blank line
        if (currentToggle && toggleBlocks.length > 0) {
          currentToggle.toggleContent = toggleBlocks;
          blocks.push(currentToggle);
          currentToggle = null;
          toggleBlocks = [];
        }
        if (currentTable && tableRows.length > 0) {
          currentTable.rows = tableRows;
          blocks.push(currentTable);
          currentTable = null;
          tableRows = [];
        }
        continue;
      }

      // Handle table rows
      if (isTableRow(trimmedLine)) {
        // Skip separator rows
        if (isTableSeparator(trimmedLine)) continue;

        // Split the line into cells
        const cells = trimmedLine
          .slice(1, -1) // Remove first and last |
          .split('|')
          .map(cell => ({
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            content: cell.trim()
          }));

        // Create new table if none exists
        if (!currentTable) {
          currentTable = createBlock('table', '', {
            rows: [],
            columns: cells.length
          });
        }

        // Add row to table
        tableRows.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          cells
        });
        continue;
      }

      // If we reach here and have a table, add it before processing the current line
      if (currentTable && tableRows.length > 0) {
        currentTable.rows = tableRows;
        blocks.push(currentTable);
        currentTable = null;
        tableRows = [];
      }

      // Check for toggle lists (lines starting with >)
      if (trimmedLine.startsWith('> ')) {
        // If we have a previous toggle, add it
        if (currentToggle && toggleBlocks.length > 0) {
          currentToggle.toggleContent = toggleBlocks;
          blocks.push(currentToggle);
        }
        
        // Start new toggle
        currentToggle = createBlock('toggle-list', trimmedLine.substring(2), {
          title: trimmedLine.substring(2),
          toggleContent: []
        });
        toggleBlocks = [];
        continue;
      }

      // Process line content based on type
      const processLine = (line: string, addToToggle = false) => {
        const trimmed = line.trim();
        let block: Block | null = null;

        // Handle todo list items first
        if (trimmed.match(/^\[[ x]\]/)) {
          const isChecked = trimmed.startsWith('[x]');
          block = createBlock('todo-list', trimmed.substring(4), {
            checked: isChecked
          });
        } else if (trimmed.startsWith('# ')) {
          block = createBlock('heading1', trimmed.substring(2));
        } else if (trimmed.startsWith('## ')) {
          block = createBlock('heading2', trimmed.substring(3));
        } else if (trimmed.startsWith('### ')) {
          block = createBlock('heading3', trimmed.substring(4));
        } else if (trimmed) {
          block = createBlock('text', trimmed);
        }

        if (block) {
          if (addToToggle) {
            toggleBlocks.push(block);
          } else {
            blocks.push(block);
          }
        }
      };

      // If we're in a toggle and the line is indented or a list item
      if (currentToggle && (
        line.startsWith('  ') || 
        line.startsWith('- ') || 
        line.match(/^\d+\./) || 
        line.match(/^\[[ x]\]/) ||
        line.match(/^\s+\[[ x]\]/)  // Handle indented todo items
      )) {
        processLine(line, true);
        continue;
      }

      // If we reach here and have a toggle, add it before processing the current line
      if (currentToggle && toggleBlocks.length > 0) {
        currentToggle.toggleContent = toggleBlocks;
        blocks.push(currentToggle);
        currentToggle = null;
        toggleBlocks = [];
      }

      // Process regular line
      processLine(line);
    }

    // Handle any remaining blocks
    if (currentToggle && toggleBlocks.length > 0) {
      currentToggle.toggleContent = toggleBlocks;
      blocks.push(currentToggle);
    }
    if (currentTable && tableRows.length > 0) {
      currentTable.rows = tableRows;
      blocks.push(currentTable);
    }

    return blocks;
  }
}

export const aiService = new AIService(); 