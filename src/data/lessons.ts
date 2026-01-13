export interface LessonData {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  overview: string;
  goals: string[];
  conceptExplanation: string[];
  realWorldUseCases: string[];
  workedExample: {
    scenario: string;
    steps: string[];
    result: string;
  };
  commonMistakes: {
    mistake: string;
    why: string;
    fix: string;
  }[];
  interactiveTask: {
    instructions: string;
    initialData: string[][];
    expectedResult: string[][];
    validationRules: string[];
  };
  hints: string[];
  answerExplanation: string;
  summary: string[];
  nextLesson: {
    id: number;
    slug: string;
    title: string;
  } | null;
  prevLesson: {
    id: number;
    slug: string;
    title: string;
  } | null;
}

export const lessons: LessonData[] = [
  {
    id: 1,
    slug: "lesson-1",
    title: "What Excel Is & How Data Works",
    description: "Understand what Excel is used for, how data is structured, and how Excel thinks about rows, columns, and cells.",
    category: "Excel Basics",
    difficulty: "beginner",
    duration: "15 min",
    overview: "By the end of this lesson, you will understand what Excel is used for, how data is structured, and how Excel \"thinks\" about rows, columns, and cells.",
    goals: [
      "Understand what Excel is and its primary purpose",
      "Learn the difference between workbooks and worksheets",
      "Understand how rows, columns, and cells work together",
      "Recognize why proper data structure matters"
    ],
    conceptExplanation: [
      "Excel is a tool for organising and analysing data. It is not just a calculator or a table. Excel stores information inside a grid made up of rows (horizontal), columns (vertical), and cells (where a row and column intersect).",
      "Each cell can contain text, numbers, dates, or formulas. A workbook is the Excel file itself, and a worksheet is a single sheet inside that file. Most Excel files contain multiple worksheets.",
      "Each row usually represents one record or item. Each column represents one type of information about that item. This structure allows Excel to sort, filter, calculate, and visualise data effectively."
    ],
    realWorldUseCases: [
      "Tracking personal expenses and budgets",
      "Managing customer lists and contact information",
      "Recording attendance for classes or events",
      "Tracking sales, inventory, or stock levels",
      "Analysing survey data and responses"
    ],
    workedExample: {
      scenario: "Imagine you want to track your monthly expenses. You need to record what you spent money on, when you spent it, and how much it cost.",
      steps: [
        "Create column headers: Date, Description, Category, Amount",
        "Enter each expense on its own row",
        "Keep the data clean with no blank rows in between",
        "Use consistent formatting for dates and amounts"
      ],
      result: "A well-organised expense tracker where each row is one expense and columns represent Date, Description, Category, and Amount. This structure allows totals, filters, and charts to work correctly."
    },
    commonMistakes: [
      {
        mistake: "Putting multiple values in one cell",
        why: "Excel cannot sort or calculate data when multiple values share a cell",
        fix: "Always put one piece of information per cell"
      },
      {
        mistake: "Leaving blank rows inside data",
        why: "Blank rows break Excel's ability to recognize your data as a continuous table",
        fix: "Keep all your data rows together without gaps"
      },
      {
        mistake: "Using merged cells for layout",
        why: "Merged cells cause problems with sorting, filtering, and formulas",
        fix: "Use formatting and column widths instead of merging"
      }
    ],
    interactiveTask: {
      instructions: "The spreadsheet below contains messy expense data. Reorganise it so that each expense is on its own row, each column has a clear header, no blank rows exist inside the dataset, and no cells contain mixed data.",
      initialData: [
        ["Expenses for January", "", "", ""],
        ["", "", "", ""],
        ["Coffee & Lunch", "Jan 5", "$15.50", ""],
        ["", "", "", ""],
        ["Bus fare, Jan 10", "", "$2.50", ""],
        ["Groceries", "Jan 12", "$45.00 + $12.00", ""]
      ],
      expectedResult: [
        ["Date", "Description", "Category", "Amount"],
        ["Jan 5", "Coffee", "Food", "15.50"],
        ["Jan 5", "Lunch", "Food", "15.50"],
        ["Jan 10", "Bus fare", "Transport", "2.50"],
        ["Jan 12", "Groceries", "Food", "45.00"],
        ["Jan 12", "Groceries", "Food", "12.00"]
      ],
      validationRules: [
        "First row must contain column headers",
        "No blank rows within the data",
        "One expense per row",
        "Each cell contains only one value"
      ]
    },
    hints: [
      "Hint 1: One row should equal one expense. If you see multiple items combined, they need to be split.",
      "Hint 2: Each column should represent one type of information only - Date, Description, Category, and Amount.",
      "Hint 3: Remove all blank rows and move the title outside the data area. Create proper headers in the first row of your data."
    ],
    answerExplanation: "A correct solution has clear headers (Date, Description, Category, Amount) in the first row. Each expense gets its own row - notice how 'Coffee & Lunch' becomes two rows, and the groceries '$45.00 + $12.00' becomes two separate entries. There are no blank rows, and each cell contains exactly one piece of information.",
    summary: [
      "Excel works best with structured data organised in a grid format",
      "Rows represent individual records or items",
      "Columns represent types of information about those records",
      "Proper structure enables sorting, filtering, calculations, and charts"
    ],
    nextLesson: {
      id: 2,
      slug: "lesson-2",
      title: "Entering & Editing Data Correctly"
    },
    prevLesson: null
  },
  {
    id: 2,
    slug: "lesson-2",
    title: "Entering & Editing Data Correctly",
    description: "Learn how to enter, edit, and manage data in Excel cells efficiently and accurately.",
    category: "Excel Basics",
    difficulty: "beginner",
    duration: "12 min",
    overview: "By the end of this lesson, you will know how to enter different types of data, edit cell contents, and use keyboard shortcuts to work faster.",
    goals: [
      "Enter text, numbers, and dates correctly",
      "Edit and delete cell contents",
      "Use the formula bar for editing",
      "Master essential keyboard shortcuts for data entry"
    ],
    conceptExplanation: [
      "Entering data in Excel is straightforward: click a cell and start typing. When you press Enter, Excel moves to the cell below. Press Tab to move to the cell on the right instead.",
      "Excel automatically recognizes what type of data you enter. Numbers align to the right, text aligns to the left, and dates can be formatted in various ways. Understanding this helps you spot errors quickly.",
      "To edit a cell, you can double-click it, press F2, or click in the formula bar. The formula bar shows the full contents of a cell and is useful when dealing with long text or formulas."
    ],
    realWorldUseCases: [
      "Entering customer information into a database",
      "Recording daily sales figures",
      "Building a contact list with names, emails, and phone numbers",
      "Creating a simple inventory list",
      "Logging time-based data like hours worked"
    ],
    workedExample: {
      scenario: "You need to create a simple contact list with names, phone numbers, and email addresses for 3 people.",
      steps: [
        "Click cell A1 and type 'Name', press Tab",
        "Type 'Phone' in B1, press Tab",
        "Type 'Email' in C1, press Enter",
        "Type the first person's name in A2, then Tab through to enter their phone and email",
        "Press Enter to move to the next row and repeat for remaining contacts"
      ],
      result: "A clean contact list with headers and three rows of data, entered efficiently using Tab and Enter to navigate."
    },
    commonMistakes: [
      {
        mistake: "Clicking away instead of pressing Enter",
        why: "You might accidentally click into the wrong cell and overwrite data",
        fix: "Use Enter or Tab to confirm entries and navigate predictably"
      },
      {
        mistake: "Forgetting to press Enter before clicking elsewhere",
        why: "Your typed data may not be saved if you click away mid-entry",
        fix: "Always confirm with Enter, Tab, or Escape before clicking elsewhere"
      },
      {
        mistake: "Typing over existing data by accident",
        why: "If you click a cell and start typing, it replaces the existing content",
        fix: "Press F2 to edit instead of replace, or use the formula bar"
      }
    ],
    interactiveTask: {
      instructions: "Enter the following contact information correctly. Each piece of data should be in the right column, with proper headers. Use efficient navigation (Tab to move right, Enter to move down).",
      initialData: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ],
      expectedResult: [
        ["Name", "Phone", "Email"],
        ["John Smith", "555-1234", "john@email.com"],
        ["Sarah Jones", "555-5678", "sarah@email.com"],
        ["Mike Brown", "555-9012", "mike@email.com"]
      ],
      validationRules: [
        "Row 1 must contain headers: Name, Phone, Email",
        "Three contacts must be entered in rows 2-4",
        "Phone numbers in correct format",
        "Email addresses in column C"
      ]
    },
    hints: [
      "Hint 1: Start by creating headers in row 1. Type 'Name' in A1, then use Tab to move to B1 for 'Phone'.",
      "Hint 2: After completing the headers, press Enter to move down to A2, then enter the first contact's name.",
      "Hint 3: The contacts to enter are: John Smith (555-1234, john@email.com), Sarah Jones (555-5678, sarah@email.com), Mike Brown (555-9012, mike@email.com)"
    ],
    answerExplanation: "The correct solution has 'Name', 'Phone', 'Email' as headers in row 1. Each contact occupies one row, with name in column A, phone in column B, and email in column C. Using Tab to move between columns and Enter to move to the next row creates an efficient workflow.",
    summary: [
      "Click a cell and type to enter data - press Enter to confirm",
      "Tab moves right, Enter moves down",
      "Double-click or press F2 to edit existing cell contents",
      "The formula bar shows and lets you edit the full cell contents"
    ],
    nextLesson: {
      id: 3,
      slug: "lesson-3",
      title: "Selecting Cells, Rows, Columns & Ranges"
    },
    prevLesson: {
      id: 1,
      slug: "lesson-1",
      title: "What Excel Is & How Data Works"
    }
  },
  {
    id: 3,
    slug: "lesson-3",
    title: "Selecting Cells, Rows, Columns & Ranges",
    description: "Master the art of selecting cells, rows, columns, and ranges to work efficiently with your data.",
    category: "Excel Basics",
    difficulty: "beginner",
    duration: "10 min",
    overview: "By the end of this lesson, you will be able to select individual cells, entire rows and columns, and custom ranges using both mouse and keyboard techniques.",
    goals: [
      "Select individual cells and ranges using click and drag",
      "Select entire rows and columns with one click",
      "Use Shift and Ctrl for advanced selections",
      "Understand range notation (e.g., A1:C5)"
    ],
    conceptExplanation: [
      "Selecting cells is fundamental to every Excel task. Before you can format, copy, delete, or calculate anything, you need to select the cells you want to work with.",
      "A range is a group of cells. Ranges are written as 'start:end', like A1:C5, which means all cells from A1 to C5. This notation is used everywhere in Excel - in formulas, formatting, and references.",
      "You can select non-adjacent cells by holding Ctrl while clicking. You can extend a selection by holding Shift and clicking the end point. These techniques save enormous amounts of time."
    ],
    realWorldUseCases: [
      "Selecting a column of numbers to sum them",
      "Highlighting a row to format it as a header",
      "Selecting multiple columns to adjust their width",
      "Choosing specific cells to copy to another location",
      "Selecting a data range to create a chart"
    ],
    workedExample: {
      scenario: "You have a sales table and need to select different parts of it: first just the headers, then all the data, then specific non-adjacent cells.",
      steps: [
        "Click on row number 1 to select the entire header row",
        "Click and drag from A2 to D10 to select all data (excluding headers)",
        "Hold Ctrl and click individual cells B3, C5, and D8 to select non-adjacent cells",
        "Click A1, hold Shift, click D10 to select the entire table range"
      ],
      result: "You've practiced four different selection methods: row selection, drag selection, Ctrl+click for non-adjacent cells, and Shift+click for extending selections."
    },
    commonMistakes: [
      {
        mistake: "Starting a new selection when you meant to extend",
        why: "Clicking without Shift replaces your current selection",
        fix: "Hold Shift before clicking to add to your selection"
      },
      {
        mistake: "Accidentally including extra cells in a selection",
        why: "Dragging too far or not noticing the selection highlight",
        fix: "Check the Name Box (shows range like A1:C5) to verify your selection"
      },
      {
        mistake: "Trying to type a range instead of selecting it",
        why: "In some dialogs you need to select, not type",
        fix: "Use the selection cursor or click the collapse button to select visually"
      }
    ],
    interactiveTask: {
      instructions: "Practice selecting different parts of this data table. Select the indicated cells and ranges as instructed.",
      initialData: [
        ["Product", "Jan", "Feb", "Mar"],
        ["Apples", "100", "120", "115"],
        ["Oranges", "80", "95", "88"],
        ["Bananas", "150", "140", "160"],
        ["Grapes", "60", "75", "70"]
      ],
      expectedResult: [
        ["Product", "Jan", "Feb", "Mar"],
        ["Apples", "100", "120", "115"],
        ["Oranges", "80", "95", "88"],
        ["Bananas", "150", "140", "160"],
        ["Grapes", "60", "75", "70"]
      ],
      validationRules: [
        "Successfully select the header row (row 1)",
        "Successfully select range B2:D5 (all the numbers)",
        "Successfully select column A (all product names)",
        "Successfully select cells B2, C3, and D4 (non-adjacent)"
      ]
    },
    hints: [
      "Hint 1: To select an entire row, click the row number on the left side. Row 1 is the header row.",
      "Hint 2: To select range B2:D5, click on B2 and drag to D5 while holding the mouse button.",
      "Hint 3: To select non-adjacent cells, hold Ctrl (Cmd on Mac) while clicking each cell: B2, then C3, then D4."
    ],
    answerExplanation: "Selecting in Excel uses consistent patterns: click row/column headers for entire rows/columns, click and drag for continuous ranges, use Ctrl+click for non-adjacent selections, and Shift+click to extend a selection. The Name Box always shows what range is currently selected.",
    summary: [
      "Click and drag to select a range of cells",
      "Click row numbers or column letters to select entire rows/columns",
      "Hold Ctrl and click to select non-adjacent cells",
      "Hold Shift and click to extend a selection",
      "Range notation like A1:C5 describes cell ranges"
    ],
    nextLesson: {
      id: 4,
      slug: "lesson-4",
      title: "Formatting Data (Without Breaking Excel)"
    },
    prevLesson: {
      id: 2,
      slug: "lesson-2",
      title: "Entering & Editing Data Correctly"
    }
  },
  {
    id: 4,
    slug: "lesson-4",
    title: "Formatting Data (Without Breaking Excel)",
    description: "Learn to format cells, numbers, and text while preserving data integrity for calculations and analysis.",
    category: "Excel Basics",
    difficulty: "beginner",
    duration: "15 min",
    overview: "By the end of this lesson, you will understand the difference between cell formatting and cell values, and know how to format numbers, text, and dates properly.",
    goals: [
      "Understand the difference between display formatting and actual values",
      "Format numbers as currency, percentages, and decimals",
      "Apply text formatting (bold, colors, alignment)",
      "Format dates correctly"
    ],
    conceptExplanation: [
      "There is a crucial difference between what a cell displays and what it actually contains. You can format the number 0.15 to show as '15%' or '$0.15' or '0.2' (rounded), but the actual value stays 0.15. This is important for calculations.",
      "Number formatting changes how values appear: currency adds symbols ($, £, €), percentage multiplies by 100 and adds %, and decimal places control precision. None of these change the underlying value.",
      "Cell formatting includes fonts, colors, borders, and alignment. These visual changes help readability but do not affect how Excel calculates or sorts your data - as long as you avoid certain pitfalls like merged cells."
    ],
    realWorldUseCases: [
      "Displaying prices with currency symbols and two decimal places",
      "Showing percentages for sales growth or interest rates",
      "Formatting dates to your preferred regional format",
      "Making headers stand out with bold text and background colors",
      "Using conditional formatting to highlight important values"
    ],
    workedExample: {
      scenario: "You have a sales report with raw numbers that need proper formatting: amounts should show as currency, percentages as %, and dates in a readable format.",
      steps: [
        "Select the amount column (B2:B10)",
        "Click Home > Number Format dropdown > Currency",
        "Select the growth column (C2:C10)",
        "Click Home > Number Format dropdown > Percentage",
        "Select the date column and choose a date format from Format Cells"
      ],
      result: "The numbers now display as £1,234.56, growth shows as 12.5%, and dates appear as '15 Jan 2024' - but the underlying values remain unchanged for calculations."
    },
    commonMistakes: [
      {
        mistake: "Typing currency symbols into cells",
        why: "Excel may treat '£50' as text, not a number, breaking calculations",
        fix: "Enter just the number (50) and apply currency formatting"
      },
      {
        mistake: "Using merged cells for layout",
        why: "Merged cells break sorting, filtering, and many formulas",
        fix: "Use 'Center Across Selection' or adjust column widths instead"
      },
      {
        mistake: "Assuming formatted numbers are the real values",
        why: "A cell showing '15%' actually contains 0.15, which affects formulas",
        fix: "Check the formula bar to see actual values"
      }
    ],
    interactiveTask: {
      instructions: "Format this sales data correctly: Column B should show as currency (2 decimal places), Column C should show as percentage (1 decimal place), and Column D should show as a short date format.",
      initialData: [
        ["Product", "Price", "Discount", "Sale Date"],
        ["Widget A", "29.99", "0.15", "2024-01-15"],
        ["Widget B", "49.5", "0.1", "2024-01-20"],
        ["Widget C", "99", "0.25", "2024-02-01"]
      ],
      expectedResult: [
        ["Product", "Price", "Discount", "Sale Date"],
        ["Widget A", "$29.99", "15.0%", "15/01/2024"],
        ["Widget B", "$49.50", "10.0%", "20/01/2024"],
        ["Widget C", "$99.00", "25.0%", "01/02/2024"]
      ],
      validationRules: [
        "Prices display with currency symbol and 2 decimal places",
        "Discounts display as percentages with 1 decimal place",
        "Dates display in a consistent short date format",
        "Underlying values remain unchanged for calculations"
      ]
    },
    hints: [
      "Hint 1: Select cells B2:B4 first, then apply Currency format from the Number Format dropdown in the Home tab.",
      "Hint 2: For percentages, select C2:C4 and apply Percentage format. Note: 0.15 will display as 15%.",
      "Hint 3: For dates, right-click the selected cells and choose 'Format Cells', then select a Short Date format."
    ],
    answerExplanation: "The correct formatting shows prices as $29.99, $49.50, and $99.00 (currency with 2 decimals). The discounts show as 15.0%, 10.0%, and 25.0% (percentage with 1 decimal). Dates appear in a consistent format. Critically, the underlying values remain as numbers and dates, not text, so calculations will still work.",
    summary: [
      "Formatting changes how data looks, not what it actually is",
      "Use number formats for currency, percentage, and decimals",
      "Type raw numbers and apply formatting - don't type symbols",
      "Check the formula bar to see actual cell values",
      "Avoid merged cells as they break Excel functionality"
    ],
    nextLesson: {
      id: 5,
      slug: "lesson-5",
      title: "Basic Calculations & Formulas"
    },
    prevLesson: {
      id: 3,
      slug: "lesson-3",
      title: "Selecting Cells, Rows, Columns & Ranges"
    }
  },
  {
    id: 5,
    slug: "lesson-5",
    title: "Basic Calculations & Formulas",
    description: "Start writing your first Excel formulas to perform calculations automatically.",
    category: "Functions",
    difficulty: "beginner",
    duration: "18 min",
    overview: "By the end of this lesson, you will understand how formulas work in Excel and be able to create basic calculations using arithmetic operators.",
    goals: [
      "Understand that formulas always start with =",
      "Use arithmetic operators (+, -, *, /)",
      "Reference cells in formulas instead of typing numbers",
      "Understand the order of operations in Excel"
    ],
    conceptExplanation: [
      "Every formula in Excel starts with an equals sign (=). This tells Excel 'calculate this' rather than treating it as text. Without the equals sign, Excel will display your formula as plain text.",
      "You can use arithmetic operators: + (add), - (subtract), * (multiply), / (divide), and ^ (power/exponent). Excel follows standard mathematical order of operations: parentheses first, then exponents, then multiplication/division, then addition/subtraction.",
      "The real power of formulas comes from referencing cells instead of typing numbers. When you write =A1+B1, Excel uses the current values in those cells. If the values change, the formula result updates automatically."
    ],
    realWorldUseCases: [
      "Calculating totals from a list of expenses",
      "Working out profit margins (revenue minus costs)",
      "Calculating percentage increases or decreases",
      "Converting units (like currency or measurements)",
      "Computing averages, taxes, or discounts"
    ],
    workedExample: {
      scenario: "You have a simple budget with income in one cell and three expenses in others. You need to calculate total expenses and remaining budget.",
      steps: [
        "Cell A1 contains income: 3000",
        "Cells B1, C1, D1 contain expenses: 800, 450, 200",
        "In E1, type =B1+C1+D1 to get total expenses (1450)",
        "In F1, type =A1-E1 to calculate remaining budget (1550)"
      ],
      result: "Your formulas automatically calculate totals. If you change any expense, both the total and remaining budget update instantly."
    },
    commonMistakes: [
      {
        mistake: "Forgetting the equals sign",
        why: "Without =, Excel treats your formula as text",
        fix: "Always start formulas with ="
      },
      {
        mistake: "Typing numbers instead of cell references",
        why: "If source data changes, your calculation won't update",
        fix: "Reference cells (=A1+B1) instead of values (=100+200)"
      },
      {
        mistake: "Wrong order of operations",
        why: "=10+5*2 equals 20, not 30 (multiplication happens first)",
        fix: "Use parentheses to control order: =(10+5)*2 equals 30"
      }
    ],
    interactiveTask: {
      instructions: "Create formulas to calculate the total and average for this sales data. The Total should add all quarterly sales. The Average should divide the total by 4.",
      initialData: [
        ["Quarter", "Sales"],
        ["Q1", "15000"],
        ["Q2", "18500"],
        ["Q3", "22000"],
        ["Q4", "19500"],
        ["Total", ""],
        ["Average", ""]
      ],
      expectedResult: [
        ["Quarter", "Sales"],
        ["Q1", "15000"],
        ["Q2", "18500"],
        ["Q3", "22000"],
        ["Q4", "19500"],
        ["Total", "75000"],
        ["Average", "18750"]
      ],
      validationRules: [
        "Cell B6 contains a formula that adds B2:B5",
        "Cell B7 contains a formula that divides the total by 4",
        "Formulas use cell references, not typed numbers",
        "Results update if source values change"
      ]
    },
    hints: [
      "Hint 1: Click cell B6 and type =B2+B3+B4+B5 to add all four quarters.",
      "Hint 2: For the average in B7, you can reference the total: =B6/4",
      "Hint 3: Alternatively, you can calculate average directly: =(B2+B3+B4+B5)/4"
    ],
    answerExplanation: "The Total formula =B2+B3+B4+B5 adds all quarterly sales to get 75000. The Average formula =B6/4 divides the total by the number of quarters to get 18750. Using cell references means if any quarterly figure changes, both calculations update automatically.",
    summary: [
      "All formulas start with = (equals sign)",
      "Use +, -, *, / for basic arithmetic",
      "Reference cells instead of typing values",
      "Parentheses control order of operations",
      "Formulas update automatically when source data changes"
    ],
    nextLesson: {
      id: 6,
      slug: "lesson-6",
      title: "Relative vs Absolute References"
    },
    prevLesson: {
      id: 4,
      slug: "lesson-4",
      title: "Formatting Data (Without Breaking Excel)"
    }
  },
  {
    id: 6,
    slug: "lesson-6",
    title: "Relative vs Absolute References",
    description: "Understand when formulas should change as you copy them and when they should stay fixed.",
    category: "Functions",
    difficulty: "beginner",
    duration: "15 min",
    overview: "By the end of this lesson, you will understand the difference between relative and absolute cell references and know when to use each type.",
    goals: [
      "Understand how relative references change when copied",
      "Learn to create absolute references with $ signs",
      "Know when to use relative, absolute, or mixed references",
      "Practice copying formulas with different reference types"
    ],
    conceptExplanation: [
      "When you copy a formula, Excel adjusts cell references based on the new location. If you copy =A1+B1 one row down, it becomes =A2+B2. This is called a relative reference - the reference is relative to the formula's position.",
      "Sometimes you need a reference that doesn't change when copied. Adding $ signs creates an absolute reference: $A$1 always refers to cell A1, no matter where you copy the formula. The $ locks the row, column, or both.",
      "Mixed references lock only the row ($A1 locks column A) or only the column (A$1 locks row 1). These are useful when copying formulas across and down simultaneously."
    ],
    realWorldUseCases: [
      "Applying a single tax rate to many prices",
      "Using a fixed exchange rate across currency conversions",
      "Referencing a header row while calculating down a column",
      "Creating multiplication tables",
      "Calculating percentages against a fixed total"
    ],
    workedExample: {
      scenario: "You have prices in column B and want to add 20% VAT. The VAT rate (0.20) is stored in cell E1 so you can change it later.",
      steps: [
        "Cell E1 contains the VAT rate: 0.20",
        "In C2, type =B2*(1+$E$1) to calculate price with VAT",
        "Copy the formula down to C3, C4, C5",
        "Because $E$1 is absolute, every row still references the same VAT rate"
      ],
      result: "All prices correctly include 20% VAT. If you change E1 to 0.25, all calculations instantly update to 25% VAT."
    },
    commonMistakes: [
      {
        mistake: "Using relative references when you need absolute",
        why: "Copying the formula changes the reference, breaking your calculation",
        fix: "Add $ signs to lock the reference: $A$1"
      },
      {
        mistake: "Making everything absolute out of caution",
        why: "Formulas that should adjust won't work when copied",
        fix: "Only lock references that should stay fixed"
      },
      {
        mistake: "Forgetting to test copied formulas",
        why: "Errors from wrong reference types may not be obvious",
        fix: "Always check a few copied cells to verify formulas are correct"
      }
    ],
    interactiveTask: {
      instructions: "Calculate the discounted price for each product. The discount rate is in cell D1. Your formula in column C should multiply the price by (1 - discount). Make sure the formula works when copied down.",
      initialData: [
        ["Discount Rate:", "", "", "0.15"],
        ["Product", "Price", "Discounted Price", ""],
        ["Laptop", "999", "", ""],
        ["Mouse", "29", "", ""],
        ["Keyboard", "79", "", ""]
      ],
      expectedResult: [
        ["Discount Rate:", "", "", "0.15"],
        ["Product", "Price", "Discounted Price", ""],
        ["Laptop", "999", "849.15", ""],
        ["Mouse", "29", "24.65", ""],
        ["Keyboard", "79", "67.15", ""]
      ],
      validationRules: [
        "Cell C3 contains a formula referencing B3 and D1",
        "D1 reference is absolute ($D$1)",
        "B reference is relative (B3, B4, B5)",
        "Formula can be copied to C4 and C5 correctly"
      ]
    },
    hints: [
      "Hint 1: The formula structure is =Price * (1 - Discount). Price is in column B, Discount is in D1.",
      "Hint 2: When referencing D1, you need dollar signs so it stays fixed when copying: $D$1",
      "Hint 3: Your formula in C3 should be: =B3*(1-$D$1)"
    ],
    answerExplanation: "The formula =B3*(1-$D$1) uses a relative reference for the price (B3) so it changes to B4, B5 when copied down, but an absolute reference for the discount ($D$1) so it always points to the same cell. This pattern is extremely common when applying a single rate or value across many rows.",
    summary: [
      "Relative references (A1) change when formulas are copied",
      "Absolute references ($A$1) stay fixed when copied",
      "Use $ before the column letter, row number, or both",
      "Press F4 to cycle through reference types while editing",
      "Mixed references ($A1 or A$1) lock only one dimension"
    ],
    nextLesson: {
      id: 7,
      slug: "lesson-7",
      title: "Sorting & Filtering Data"
    },
    prevLesson: {
      id: 5,
      slug: "lesson-5",
      title: "Basic Calculations & Formulas"
    }
  },
  {
    id: 7,
    slug: "lesson-7",
    title: "Sorting & Filtering Data",
    description: "Learn to organise and find data quickly using Excel's sorting and filtering tools.",
    category: "Data Analysis",
    difficulty: "beginner",
    duration: "14 min",
    overview: "By the end of this lesson, you will be able to sort data in various ways and use filters to show only the information you need.",
    goals: [
      "Sort data alphabetically and numerically",
      "Sort by multiple columns (multi-level sort)",
      "Apply filters to show specific data",
      "Clear filters and restore full data view"
    ],
    conceptExplanation: [
      "Sorting rearranges your data based on the values in one or more columns. You can sort A-Z, Z-A, smallest to largest, or largest to smallest. Sorting helps you find information quickly and identify patterns.",
      "When sorting, Excel keeps each row together - it doesn't just rearrange one column. This is why proper data structure (from Lesson 1) matters. If you have blank rows or merged cells, sorting will produce unexpected results.",
      "Filtering doesn't rearrange data - it temporarily hides rows that don't match your criteria. This is perfect for focusing on specific subsets of data, like 'show only January sales' or 'show products over £100'."
    ],
    realWorldUseCases: [
      "Finding your highest and lowest sales by sorting",
      "Filtering to see only a specific product category",
      "Sorting customer lists alphabetically by surname",
      "Filtering data to a specific date range",
      "Creating sorted reports from raw data"
    ],
    workedExample: {
      scenario: "You have a sales list with columns for Product, Category, and Revenue. You want to find your best sellers and focus on Electronics only.",
      steps: [
        "Click any cell in your data, then Data > Sort",
        "Sort by Revenue, largest to smallest",
        "Now your best sellers are at the top",
        "Click Data > Filter to add dropdown arrows to headers",
        "Click the Category dropdown and select only 'Electronics'",
        "Now you see only Electronics products, still sorted by revenue"
      ],
      result: "Your top Electronics products are visible, sorted by revenue, while other categories are hidden but not deleted."
    },
    commonMistakes: [
      {
        mistake: "Sorting only one column instead of the whole table",
        why: "This separates data from its row, creating incorrect records",
        fix: "Expand the selection when prompted, or select all data first"
      },
      {
        mistake: "Forgetting that filtering hides, not deletes",
        why: "Users sometimes think filtered-out data is gone",
        fix: "Clear filters to see all data again (Data > Clear)"
      },
      {
        mistake: "Trying to sort data with merged cells",
        why: "Merged cells cannot be sorted properly",
        fix: "Unmerge cells before sorting"
      }
    ],
    interactiveTask: {
      instructions: "This employee data needs to be organised. First, sort it by Department (A-Z), then filter to show only the 'Sales' department.",
      initialData: [
        ["Name", "Department", "Salary"],
        ["Emma Wilson", "Marketing", "45000"],
        ["James Brown", "Sales", "52000"],
        ["Sofia Garcia", "IT", "65000"],
        ["Oliver Chen", "Sales", "48000"],
        ["Mia Johnson", "Marketing", "47000"],
        ["Liam Patel", "Sales", "55000"]
      ],
      expectedResult: [
        ["Name", "Department", "Salary"],
        ["James Brown", "Sales", "52000"],
        ["Oliver Chen", "Sales", "48000"],
        ["Liam Patel", "Sales", "55000"]
      ],
      validationRules: [
        "Data is sorted alphabetically by Department",
        "Only Sales department employees are visible",
        "Original data is intact (hidden rows still exist)",
        "All Sales employees are shown (3 people)"
      ]
    },
    hints: [
      "Hint 1: Select any cell in your data, then go to Data > Sort. Choose 'Department' as the column to sort by, and select A to Z order.",
      "Hint 2: After sorting, go to Data > Filter. Small dropdown arrows will appear in your header row.",
      "Hint 3: Click the dropdown arrow in the Department header, uncheck 'Select All', then check only 'Sales'."
    ],
    answerExplanation: "First, sorting by Department A-Z groups all departments together. Then, applying a filter for 'Sales' hides the IT and Marketing rows, showing only the three Sales employees. The hidden data isn't deleted - clicking 'Clear' in the Data tab will show all employees again.",
    summary: [
      "Sorting rearranges data by values in a column",
      "Always sort with your full data selected to keep rows intact",
      "Filtering temporarily hides rows that don't match criteria",
      "Filter dropdowns appear in the header row",
      "Clear filters to restore the full view of your data"
    ],
    nextLesson: {
      id: 8,
      slug: "lesson-8",
      title: "Intro to Common Functions (SUM, AVERAGE, COUNT)"
    },
    prevLesson: {
      id: 6,
      slug: "lesson-6",
      title: "Relative vs Absolute References"
    }
  },
  {
    id: 8,
    slug: "lesson-8",
    title: "Intro to Common Functions (SUM, AVERAGE, COUNT)",
    description: "Learn Excel's most essential functions to summarise and analyse data quickly.",
    category: "Functions",
    difficulty: "beginner",
    duration: "16 min",
    overview: "By the end of this lesson, you will be able to use SUM, AVERAGE, COUNT, MIN, and MAX functions to summarise data efficiently.",
    goals: [
      "Understand function syntax: =FUNCTION(arguments)",
      "Use SUM to add numbers in a range",
      "Use AVERAGE to calculate mean values",
      "Use COUNT, MIN, and MAX for data analysis"
    ],
    conceptExplanation: [
      "Functions are pre-built formulas that perform specific calculations. Instead of typing =A1+A2+A3+A4+A5, you can write =SUM(A1:A5). Functions save time and reduce errors.",
      "Every function follows the same pattern: =FUNCTIONNAME(arguments). Arguments are the inputs - usually cell references or ranges. SUM(A1:A10) means 'add all numbers from A1 to A10'.",
      "Excel has hundreds of functions, but five cover most basic needs: SUM (total), AVERAGE (mean), COUNT (how many numbers), MIN (smallest), and MAX (largest). Master these first."
    ],
    realWorldUseCases: [
      "Summing monthly expenses or sales figures",
      "Calculating average test scores or ratings",
      "Counting how many orders were placed",
      "Finding the highest and lowest prices in a range",
      "Creating summary statistics for reports"
    ],
    workedExample: {
      scenario: "You have weekly sales figures for a month and need to create a summary showing total, average, number of entries, highest, and lowest sales.",
      steps: [
        "Sales data is in cells B2:B5 (four weeks)",
        "In B7, type =SUM(B2:B5) to get total sales",
        "In B8, type =AVERAGE(B2:B5) to get weekly average",
        "In B9, type =COUNT(B2:B5) to count entries (4)",
        "In B10, type =MAX(B2:B5) to find best week",
        "In B11, type =MIN(B2:B5) to find worst week"
      ],
      result: "A complete summary dashboard that updates automatically if any weekly figure changes."
    },
    commonMistakes: [
      {
        mistake: "Forgetting the opening parenthesis",
        why: "=SUMA1:A10 is not valid syntax",
        fix: "Always include parentheses: =SUM(A1:A10)"
      },
      {
        mistake: "Including header cells in the range",
        why: "Text in headers can cause errors or be ignored inconsistently",
        fix: "Start your range from the first data cell, not the header"
      },
      {
        mistake: "Using AVERAGE when some cells are blank",
        why: "Blanks are ignored, which may skew your average unexpectedly",
        fix: "Decide if blanks should be zeros (enter 0) or excluded"
      }
    ],
    interactiveTask: {
      instructions: "Calculate summary statistics for this student test scores data. Complete the Summary column with the appropriate functions.",
      initialData: [
        ["Student", "Score"],
        ["Alice", "85"],
        ["Bob", "72"],
        ["Carol", "91"],
        ["David", "68"],
        ["Eve", "88"],
        ["", ""],
        ["Summary", "Value"],
        ["Total", ""],
        ["Average", ""],
        ["Count", ""],
        ["Highest", ""],
        ["Lowest", ""]
      ],
      expectedResult: [
        ["Student", "Score"],
        ["Alice", "85"],
        ["Bob", "72"],
        ["Carol", "91"],
        ["David", "68"],
        ["Eve", "88"],
        ["", ""],
        ["Summary", "Value"],
        ["Total", "404"],
        ["Average", "80.8"],
        ["Count", "5"],
        ["Highest", "91"],
        ["Lowest", "68"]
      ],
      validationRules: [
        "Total cell contains =SUM(B2:B6)",
        "Average cell contains =AVERAGE(B2:B6)",
        "Count cell contains =COUNT(B2:B6)",
        "Highest contains =MAX(B2:B6)",
        "Lowest contains =MIN(B2:B6)"
      ]
    },
    hints: [
      "Hint 1: For Total, use =SUM(B2:B6) to add all five scores.",
      "Hint 2: The AVERAGE, COUNT, MAX, and MIN functions use the same range: B2:B6",
      "Hint 3: The complete formulas are: =SUM(B2:B6), =AVERAGE(B2:B6), =COUNT(B2:B6), =MAX(B2:B6), =MIN(B2:B6)"
    ],
    answerExplanation: "Each function takes the same range B2:B6 (the five scores). SUM adds them (404), AVERAGE divides the sum by count (80.8), COUNT counts numeric entries (5), MAX finds the highest (91), MIN finds the lowest (68). These five functions form the foundation of data analysis in Excel.",
    summary: [
      "Functions follow the pattern =NAME(arguments)",
      "SUM adds all numbers in a range",
      "AVERAGE calculates the mean of a range",
      "COUNT counts how many cells contain numbers",
      "MIN and MAX find the smallest and largest values"
    ],
    nextLesson: {
      id: 9,
      slug: "lesson-9",
      title: "IF Statements (Beginner)"
    },
    prevLesson: {
      id: 7,
      slug: "lesson-7",
      title: "Sorting & Filtering Data"
    }
  },
  {
    id: 9,
    slug: "lesson-9",
    title: "IF Statements (Beginner)",
    description: "Learn to make Excel decisions for you using logical IF statements.",
    category: "Functions",
    difficulty: "beginner",
    duration: "18 min",
    overview: "By the end of this lesson, you will understand how IF statements work and be able to create simple conditional logic in your spreadsheets.",
    goals: [
      "Understand the structure of an IF statement",
      "Create conditions using comparison operators",
      "Return different results based on conditions",
      "Handle basic true/false scenarios"
    ],
    conceptExplanation: [
      "The IF function lets Excel make decisions. It tests a condition and returns one value if true, another if false. The syntax is: =IF(condition, value_if_true, value_if_false).",
      "Conditions use comparison operators: = (equal), <> (not equal), > (greater than), < (less than), >= (greater or equal), <= (less or equal). For example, A1>50 tests if cell A1 contains a number greater than 50.",
      "The true and false results can be numbers, text (in quotes), or even other calculations. =IF(A1>50, \"Pass\", \"Fail\") returns the text 'Pass' if A1 is over 50, otherwise 'Fail'."
    ],
    realWorldUseCases: [
      "Marking students as Pass or Fail based on scores",
      "Categorising expenses as 'Over Budget' or 'Within Budget'",
      "Calculating bonuses only if sales targets are met",
      "Flagging overdue invoices",
      "Assigning price tiers based on quantity ordered"
    ],
    workedExample: {
      scenario: "You have student scores and need to automatically assign 'Pass' (50 or above) or 'Fail' (below 50) grades.",
      steps: [
        "Scores are in column B, you need results in column C",
        "In C2, type =IF(B2>=50, \"Pass\", \"Fail\")",
        "This tests: is B2 greater than or equal to 50?",
        "If yes, display 'Pass'. If no, display 'Fail'",
        "Copy the formula down for all students"
      ],
      result: "Column C now shows Pass or Fail automatically for each student. If you change a score, the result updates instantly."
    },
    commonMistakes: [
      {
        mistake: "Forgetting quotes around text results",
        why: "=IF(A1>50, Pass, Fail) causes an error - Excel thinks Pass is a cell name",
        fix: "Put text in double quotes: \"Pass\", \"Fail\""
      },
      {
        mistake: "Using = instead of == for comparison",
        why: "Unlike some programming languages, Excel uses single = in IF conditions",
        fix: "Use =IF(A1=50, ...) not =IF(A1==50, ...)"
      },
      {
        mistake: "Missing the third argument",
        why: "=IF(A1>50, \"Pass\") works but returns FALSE when condition isn't met",
        fix: "Always specify what to return for both outcomes"
      }
    ],
    interactiveTask: {
      instructions: "Add a Status column to this order data. Orders of £100 or more should show 'Free Shipping', orders under £100 should show 'Standard Shipping'.",
      initialData: [
        ["Order ID", "Amount", "Status"],
        ["ORD001", "85.50", ""],
        ["ORD002", "142.00", ""],
        ["ORD003", "99.99", ""],
        ["ORD004", "100.00", ""],
        ["ORD005", "67.25", ""]
      ],
      expectedResult: [
        ["Order ID", "Amount", "Status"],
        ["ORD001", "85.50", "Standard Shipping"],
        ["ORD002", "142.00", "Free Shipping"],
        ["ORD003", "99.99", "Standard Shipping"],
        ["ORD004", "100.00", "Free Shipping"],
        ["ORD005", "67.25", "Standard Shipping"]
      ],
      validationRules: [
        "C2:C6 contain IF formulas",
        "Orders >= 100 show 'Free Shipping'",
        "Orders < 100 show 'Standard Shipping'",
        "Formula uses B column reference"
      ]
    },
    hints: [
      "Hint 1: The IF function structure is =IF(condition, true_result, false_result)",
      "Hint 2: Your condition should check if the amount is >= 100. Use B2>=100 for the first order.",
      "Hint 3: The complete formula is: =IF(B2>=100, \"Free Shipping\", \"Standard Shipping\")"
    ],
    answerExplanation: "The formula =IF(B2>=100, \"Free Shipping\", \"Standard Shipping\") checks each order amount. ORD001 (85.50) and ORD003 (99.99) are under 100, so they get Standard Shipping. ORD002 (142.00) and ORD004 (exactly 100.00) qualify for Free Shipping. Note that >= means 'greater than OR equal to'.",
    summary: [
      "IF tests a condition and returns different values based on the result",
      "Syntax: =IF(condition, value_if_true, value_if_false)",
      "Use comparison operators: =, <>, >, <, >=, <=",
      "Put text results in double quotes",
      "Always specify both true and false outcomes"
    ],
    nextLesson: {
      id: 10,
      slug: "lesson-10",
      title: "Simple Charts & Visualisation"
    },
    prevLesson: {
      id: 8,
      slug: "lesson-8",
      title: "Intro to Common Functions (SUM, AVERAGE, COUNT)"
    }
  },
  {
    id: 10,
    slug: "lesson-10",
    title: "Simple Charts & Visualisation",
    description: "Transform your data into visual charts that communicate insights at a glance.",
    category: "Data Analysis",
    difficulty: "beginner",
    duration: "16 min",
    overview: "By the end of this lesson, you will be able to create basic charts, choose the right chart type for your data, and customise chart elements.",
    goals: [
      "Understand when to use different chart types",
      "Create a basic column, bar, and pie chart",
      "Add and format chart titles and labels",
      "Modify chart colours and styles"
    ],
    conceptExplanation: [
      "Charts transform numbers into visual patterns that humans process much faster than raw data. A good chart instantly communicates trends, comparisons, and proportions that might take minutes to extract from a table.",
      "Different chart types serve different purposes: Column/bar charts compare values across categories. Line charts show trends over time. Pie charts show parts of a whole (percentages). Choose the type that best matches your data story.",
      "Creating a chart in Excel is simple: select your data (including headers), go to Insert, and choose a chart type. Excel creates a chart that you can then customise with titles, colours, and formatting."
    ],
    realWorldUseCases: [
      "Visualising monthly sales trends with a line chart",
      "Comparing product performance with column charts",
      "Showing budget allocation with pie charts",
      "Creating dashboard reports for management",
      "Presenting survey results graphically"
    ],
    workedExample: {
      scenario: "You have quarterly sales data for three products and want to create a column chart comparing their performance.",
      steps: [
        "Select your data including headers (A1:D4)",
        "Go to Insert > Charts > Column > Clustered Column",
        "Excel creates a basic chart",
        "Click the chart title and type 'Quarterly Sales Comparison'",
        "Click Chart Elements (+) and add Data Labels",
        "Double-click any bar to change its colour if needed"
      ],
      result: "A professional column chart showing all three products across four quarters, making it easy to see which product performs best and seasonal trends."
    },
    commonMistakes: [
      {
        mistake: "Selecting the wrong data range",
        why: "Charts may miss data or include unwanted cells",
        fix: "Check that your selection includes headers and all relevant data"
      },
      {
        mistake: "Using pie charts for comparisons over time",
        why: "Pie charts show parts of a whole, not trends",
        fix: "Use line or column charts for time-based comparisons"
      },
      {
        mistake: "Creating cluttered charts with too much data",
        why: "Charts with 20+ categories become unreadable",
        fix: "Summarise data or use multiple charts"
      }
    ],
    interactiveTask: {
      instructions: "This monthly expense data needs to be visualised. Create a pie chart showing the proportion of spending in each category.",
      initialData: [
        ["Category", "Amount"],
        ["Housing", "1200"],
        ["Food", "450"],
        ["Transport", "200"],
        ["Utilities", "150"],
        ["Entertainment", "100"]
      ],
      expectedResult: [
        ["Category", "Amount"],
        ["Housing", "1200"],
        ["Food", "450"],
        ["Transport", "200"],
        ["Utilities", "150"],
        ["Entertainment", "100"]
      ],
      validationRules: [
        "A pie chart is created from the data",
        "All five categories are represented",
        "Housing is the largest segment",
        "Chart has a title"
      ]
    },
    hints: [
      "Hint 1: Select cells A1:B6 (both columns, including headers) before creating the chart.",
      "Hint 2: Go to Insert > Charts > Pie > choose the first pie chart option.",
      "Hint 3: Click on the chart title to edit it. Add data labels by clicking the + icon next to the chart."
    ],
    answerExplanation: "Selecting A1:B6 and inserting a pie chart creates a visual showing each expense category as a slice. Housing (1200) is the largest slice since it's the biggest expense. The pie chart is ideal here because we're showing how a total (all expenses) breaks down into parts (categories). Adding a title like 'Monthly Expenses Breakdown' and data labels (percentages or values) makes the chart more informative.",
    summary: [
      "Charts make data patterns visible at a glance",
      "Column/bar charts compare categories, line charts show trends, pie charts show proportions",
      "Select data with headers before creating a chart",
      "Customise with titles, labels, and colours",
      "Choose the chart type that best tells your data story"
    ],
    nextLesson: null,
    prevLesson: {
      id: 9,
      slug: "lesson-9",
      title: "IF Statements (Beginner)"
    }
  }
];

export function getLessonBySlug(slug: string): LessonData | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getLessonById(id: number): LessonData | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getAllLessons(): LessonData[] {
  return lessons;
}
