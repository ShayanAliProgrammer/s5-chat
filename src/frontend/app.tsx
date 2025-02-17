"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Route, Routes } from "react-router";

const ChatPage = React.memo(dynamic(() => import("./features/chat-page")));
const WelcomePage = React.memo(
  dynamic(() => import("./features/welcome-page")),
);

const App = React.memo(
  React.cache(function App() {
    return (
      <>
        <Routes>
          <Route path="chat/:chatID" element={<ChatPage />} />
          <Route path="" element={<WelcomePage />} />
        </Routes>
      </>
    );
  }),
);

export default App;
