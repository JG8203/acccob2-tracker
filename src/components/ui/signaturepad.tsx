import React, { forwardRef, useImperativeHandle, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

function trimCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const l = pixels.data.length;
  const bound: {
    top: number | null;
    left: number | null;
    right: number | null;
    bottom: number | null;
  } = {
    top: null,
    left: null,
    right: null,
    bottom: null,
  };
  let i, x, y;

  for (i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) {
      x = (i / 4) % canvas.width;
      y = ~~(i / 4 / canvas.width);

      if (bound.top === null) {
        bound.top = y;
      }

      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }

      if (bound.right === null) {
        bound.right = x;
      } else if (bound.right < x) {
        bound.right = x;
      }

      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  if (bound.top === null) {
    return canvas;
  }

  const trimHeight = bound.bottom! - bound.top! + 1;
  const trimWidth = bound.right! - bound.left! + 1;
  const trimmed = ctx.getImageData(
    bound.left!,
    bound.top!,
    trimWidth,
    trimHeight
  );

  const copy = document.createElement("canvas");
  copy.width = trimWidth;
  copy.height = trimHeight;
  copy.getContext("2d")?.putImageData(trimmed, 0, 0);

  return copy;
}

export interface SignaturePadRef {
  clear: () => void;
  getTrimmedCanvas: () => HTMLCanvasElement;
  isEmpty: () => boolean;
  fromDataURL: (dataURL: string) => void;
}

interface SignaturePadProps {
  penColor?: string;
  canvasProps: React.CanvasHTMLAttributes<HTMLCanvasElement>;
  clearOnResize?: boolean;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ penColor = "black", canvasProps, clearOnResize = true }, ref) => {
    const signCanvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signCanvasRef.current?.clear();
      },
      isEmpty: () => {
        return signCanvasRef.current?.isEmpty() || false;
      },
      getTrimmedCanvas: () => {
        if (!signCanvasRef.current) {
          const emptyCanvas = document.createElement("canvas");
          emptyCanvas.width = (canvasProps.width as number) || 300;
          emptyCanvas.height = (canvasProps.height as number) || 150;
          return emptyCanvas;
        }

        const canvas = signCanvasRef.current.getCanvas();
        const copy = document.createElement("canvas");
        copy.width = canvas.width;
        copy.height = canvas.height;
        copy.getContext("2d")?.drawImage(canvas, 0, 0);

        return trimCanvas(copy);
      },
      fromDataURL: (dataURL: string) => {
        signCanvasRef.current?.fromDataURL(dataURL);
      },
    }));

    return (
      <SignatureCanvas
        ref={signCanvasRef}
        penColor={penColor}
        canvasProps={canvasProps}
        clearOnResize={clearOnResize}
      />
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
