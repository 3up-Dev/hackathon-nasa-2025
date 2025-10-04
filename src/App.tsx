import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Teste minimalista
const TestComponent = () => {
  return <div>Test React Working</div>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
