import { View } from "@novorender/api";
// import { type MeasureEntity } from "@novorender/api/types/measure";

// we export this function to our react component which will then execute it once the demo started running.
export function showTip() {
  return openAlert(
    "Click to select parametric object, parametric data will be shown in an alert dialog. Select another object and the measurement data between the objects will be shown in the alert dialog. Clicking further objects will alternate between first and second selected and show measure values within an alert dialog."
  );
}

export async function main(view: View, canvas: HTMLCanvasElement) {
  const measureView = await view.measure;

  // Parametric entities used to measure between
  // @todo - implement interface `MeasureEntity`
  let measureEntity1: any | undefined = undefined;
  let measureEntity2: any | undefined = undefined;

  // number to alternate between selected entities.
  let selectEntity: 1 | 2 = 1;

  canvas.onclick = async (e: MouseEvent) => {
    const result = await view.pick(e.offsetX, e.offsetY);
    if (result) {
      const { objectId, position } = result;

      if (selectEntity === 1) {
        // Find measure entity at pick location
        measureEntity1 = (await measureView.core.pickMeasureEntity(objectId, position)).entity;
        selectEntity = 2;
      } else {
        // Find measure entity at pick location
        measureEntity2 = (await measureView.core.pickMeasureEntity(objectId, position)).entity;
        selectEntity = 1;
      }
      // As long as one object is selected log out the values
      // Note that if measureEntity2 is undefined then the result will be the parametric values of measureEntity1
      if (measureEntity1) {
        const _log = await measureView.core.measure(measureEntity1, measureEntity2);
        openInfoPane(_log);
      }
    }
  };
}
