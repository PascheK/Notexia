import { defaultTheme } from '@/config/ui-theme';

export type PaneId = 'sidebar' | 'notesList' | 'noteEditor';

export interface PaneConfig {
  id: PaneId;
  visible: boolean;
  width: number; // percentage
}

export interface PaneLayoutState {
  panes: PaneConfig[];
}

const { sidebarWidth, notesPaneMinWidth, editorPaneMinWidth } = defaultTheme.layout;
const availableSpace = 100 - sidebarWidth;
const ratio = notesPaneMinWidth / (notesPaneMinWidth + editorPaneMinWidth);
const notesWidth = Math.round(availableSpace * ratio);
const editorWidth = 100 - sidebarWidth - notesWidth;

export const defaultPaneLayout: PaneLayoutState = {
  panes: [
    { id: 'sidebar', visible: true, width: sidebarWidth },
    { id: 'notesList', visible: true, width: notesWidth },
    { id: 'noteEditor', visible: true, width: editorWidth },
  ],
};
