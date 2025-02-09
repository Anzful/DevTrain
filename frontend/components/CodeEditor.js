// frontend/components/CodeEditor.js
import { useEffect } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';

export default function CodeEditor({ value, onChange, language, className }) {
  const getMode = () => {
    switch (language) {
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'python':
      default:
        return 'python';
    }
  };

  return (
    <AceEditor
      mode={getMode()}
      theme="monokai"
      onChange={onChange}
      value={value}
      name="code-editor"
      editorProps={{ $blockScrolling: true }}
      width="100%"
      height="400px"
      className={className}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
}
