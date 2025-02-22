"use client";

import { useState } from "react";
import copy from "clipboard-copy";
import { Button } from "./button";

const CopyToClipboardButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = async () => {
    try {
      await copy(text);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy text to clipboard", error);
    }
  };

  return (
    <div>
      <Button onClick={handleCopyClick}>
        {isCopied ? "Copied!" : "Copy Google Sheets Data"}
      </Button>
    </div>
  );
};

export default CopyToClipboardButton;
