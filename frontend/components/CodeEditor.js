// frontend/components/CodeEditor.js
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value = '', onChange, language = 'javascript' }) {
  return (
    <Editor
      height="400px"
      defaultLanguage={language}
      value={value}
      theme="vs-dark"
      onChange={(newValue) => onChange && onChange(newValue)}
      options={{ automaticLayout: true }}
    />
  );
}
