"use client";

import dynamic from "next/dynamic";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";

const ChatPage = React.memo(dynamic(() => import("./features/chat-page")));
const WelcomePage = React.memo(
  dynamic(() => import("./features/welcome-page")),
);

const App = React.memo(function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route
          path=""
          element={
            // <Suspense fallback={<Loading />}>
            <WelcomePage />
            // </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
});
export default App;
