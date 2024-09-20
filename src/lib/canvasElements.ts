import { MutableRefObject } from "react";
import { CustomFabricObject } from "../../types";
import { fabric } from "fabric";
export const handleImageUpload = ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: {
  file: File;
  canvas: MutableRefObject<fabric.Canvas>;
  shapeRef: MutableRefObject<fabric.Object | null>;
  syncShapeInStorage: (shape: fabric.Object) => void;
}) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result as string, (img: fabric.Image) => {
      img.scaleToWidth(200);
      img.scaleToHeight(200);

      canvas.current.add(img);
      //@ts-expect-error: W T F
      img.objectId = v4();

      shapeRef.current = img;

      syncShapeInStorage(img);
      canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

export const handleDelete = (
  canvas: fabric.Canvas,
  deleteShapeFromStorage: (id: string) => void,
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  if (activeObjects.length > 0)
    activeObjects.forEach((obj: CustomFabricObject<any>) => {
      if (!obj.objectId) return;
      canvas.remove(obj);
      deleteShapeFromStorage(obj.objectId);
    });

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};
