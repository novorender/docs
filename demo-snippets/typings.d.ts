// whenever we import typescript files with the .ts extension, it's a demo code snippet that we want to treat as a url rather than actual code.
declare module "*.ts?raw" {
    const content: string;
    export default content;
}

/**
* @description opens an alert that displays provided content
* @param content string to show in the alert
*/
declare function openAlert(content: string, type: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' = 'info'): void;

/**
* @description opens a pane in bottom left of renderer to show any text
* @param content string to show in the info pane
*/
declare function openInfoPane(content: string | object | any): void;