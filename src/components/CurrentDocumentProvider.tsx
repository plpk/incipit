"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CurrentDocument = {
  id: string;
  file_url: string | null;
  file_type: string | null;
  original_filename: string;
};

type ContextShape = {
  doc: CurrentDocument | null;
  setDoc: (d: CurrentDocument | null) => void;
};

const Ctx = createContext<ContextShape | null>(null);

export function CurrentDocumentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [doc, setDoc] = useState<CurrentDocument | null>(null);
  const value = useMemo(() => ({ doc, setDoc }), [doc]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrentDocument(): CurrentDocument | null {
  const ctx = useContext(Ctx);
  return ctx?.doc ?? null;
}

/**
 * Rendered from the document detail page to publish the current doc
 * to the Sidebar via context. Clears on unmount so stale thumbnails
 * don't linger when navigating away.
 */
export function SetCurrentDocument(props: CurrentDocument) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    if (!ctx) return;
    ctx.setDoc({
      id: props.id,
      file_url: props.file_url,
      file_type: props.file_type,
      original_filename: props.original_filename,
    });
    return () => {
      ctx.setDoc(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id, props.file_url, props.file_type, props.original_filename]);
  return null;
}
