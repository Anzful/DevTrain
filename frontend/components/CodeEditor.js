// frontend/components/CodeEditor.js
import { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';

// Import ace modes and themes
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const CodeEditor = ({ value, onChange, language = 'javascript', theme = 'monokai' }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      });
    }
  }, []);

  return (
    <AceEditor
      ref={editorRef}
      mode={language}
      theme={theme}
      onChange={onChange}
      value={value}
      name="code-editor"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        useWorker: false,
        showPrintMargin: false,
        fontSize: 14,
        highlightActiveLine: true,
        showGutter: true,
        wrap: true,
      }}
      style={{
        width: '100%',
        height: '400px',
        fontSize: '14px',
      }}
    />
  );
};

export default CodeEditor;
