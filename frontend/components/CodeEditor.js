// frontend/components/CodeEditor.js
import { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';

// Import ace modes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';

// Import theme
import 'ace-builds/src-noconflict/theme-one_dark';

// Import extensions
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'javascript', 
  height = '500px' 
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
        printMargin: false,
      });

      // Set editor colors and styling
      editor.renderer.setOptions({
        showGutter: true,
        fontSize: '14px',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        highlightActiveLine: true,
        highlightSelectedWord: true,
        cursorStyle: 'smooth',
        behavioursEnabled: true,
        wrapBehavioursEnabled: true,
      });

      // Customize specific syntax colors if needed
      editor.container.style.backgroundColor = '#282c34';
    }
  }, []);

  return (
    <div className="rounded-lg overflow-hidden border border-navy-600">
      <AceEditor
        ref={editorRef}
        mode={language.toLowerCase()}
        theme="one_dark"
        onChange={onChange}
        value={value}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height={height}
        setOptions={{
          useWorker: false,
          showPrintMargin: false,
          fontSize: 14,
          highlightActiveLine: true,
          highlightGutterLine: true,
          showGutter: true,
          wrap: true,
          enableSnippets: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
        }}
        style={{
          backgroundColor: '#282c34', // Dark gray background
          lineHeight: 1.6,
        }}
        commands={[
          {
            name: 'save',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: () => {
              console.log('Save triggered');
            }
          },
          {
            name: 'format',
            bindKey: { win: 'Ctrl-Alt-L', mac: 'Command-Alt-L' },
            exec: () => {
              console.log('Format triggered');
            }
          }
        ]}
      />
    </div>
  );
};

export default CodeEditor;
