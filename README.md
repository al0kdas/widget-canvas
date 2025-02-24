# Widget Editor

A responsive React component that provides a drag-and-drop interface for creating and arranging different types of widgets on a canvas. The editor supports multiple widget types and provides a flexible layout system with mobile responsiveness.

## Features

### Core Functionality
- Drag and drop interface for widget placement
- Free-form positioning on canvas
- Local storage persistence
- Responsive design with mobile support
- Collapsible sidebar for mobile devices

### Widget Types
1. **Text Widget**
   - Double-click to edit text content
   - Real-time content updates
   - Markdown support

2. **Button Widget**
   - Customizable button text
   - Double-click to edit button label
   - Consistent styling with hover states

3. **Table Widget**
   - Dynamic row and column management
   - Add/remove rows and columns
   - Cell content editing
   - Responsive table layout

4. **Image Widget**
   - Configurable width and height
   - URL customization
   - Resize controls
   - Aspect ratio maintenance
   - Image placeholder support

## Installation

1. Install the required dependencies:
```bash
npm install react lucide-react
# or
yarn add react lucide-react
```

2. Make sure you have Tailwind CSS configured in your project:
```bash
npm install -D tailwindcss
# or
yarn add -D tailwindcss
```

3. Copy the `WidgetEditor.js` component into your project.

## Usage

```jsx
import WidgetEditor from './components/WidgetEditor';

function App() {
  return (
    <div>
      <WidgetEditor />
    </div>
  );
}

export default App;
```

## Component Structure

```
WidgetEditor/
├── Main Component
│   ├── Sidebar
│   │   └── Widget Selection
│   └── Canvas
│       └── Draggable Widgets
├── Widget Components
│   ├── TextWidget
│   ├── ButtonWidget
│   ├── TableWidget
│   └── ImageWidget
└── Utility Functions
    ├── Drag and Drop Handlers
    ├── Widget Content Management
    └── Local Storage Integration
```

## Widget Interactions

### Adding Widgets
1. Drag a widget from the sidebar
2. Drop it anywhere on the canvas
3. Widget will be placed at the drop location

### Editing Widgets
- **Text**: Double-click to edit text content
- **Button**: Double-click to change button text
- **Table**: 
  - Use "Add Row" and "Add Column" buttons
  - Double-click cells to edit content
  - Click remove buttons to delete rows/columns
- **Image**: 
  - Double-click to change image URL
  - Use resize button to adjust dimensions

### Moving Widgets
- Click and drag any widget to reposition
- Widgets can be placed anywhere on the canvas
- Positions are saved automatically

## Props and Configuration

The WidgetEditor component currently doesn't accept any props, as it manages its own state internally. All widget configurations are handled through the UI.

## Local Storage

The editor automatically saves the following information to localStorage:
- Widget positions
- Widget content
- Widget configurations
- Canvas layout

Data is saved under the key 'widgets' in the following format:
```javascript
{
  id: string,
  type: string,
  content: any,
  position: { x: number, y: number }
}
```

### Prerequisites
- Node.js 14+
- React 17+
- Tailwind CSS 2+

### Local Development
1. Clone the repository
2. Install dependencies
3. Start the development server(npm run start)

