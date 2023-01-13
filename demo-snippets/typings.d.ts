// whenever we import typescript files with the .ts extension, it's a demo code snippet that we want to treat as a url rather than actual code.
declare module "*.ts?raw" {
    const content: string;
    export default content;
}

/**
* @description opens an alert that displays provided content
* @param content string to show in the alert
*/
declare function openAlert(content: string): void;