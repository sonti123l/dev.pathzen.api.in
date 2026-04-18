import type { ModuleDataForCourse } from "../@types/interfaces/createDataType.js";
import { db } from "../db/db.js";
import { subModules } from "../db/schema/subModules.js";

interface ModuleAndSubModuleDetails {
  module_id: number;
  module_name: string;
  course_id_for_module: number | null;
  is_module_complete: boolean | null;
  sub_module_id: number | null;
  sub_module_title: string | null;
  is_sub_module_completed: boolean | null;
  sub_module_in_module_id: number | null;
}

interface subModuleObjectData {
  module_id: number;
  module_name: string;
  course_id_for_module: number;
  is_module_complete: boolean;
  sub_modules: SubModuleDetails[];
}

interface SubModuleDetails {
  sub_module_id: number;
  sub_module_title: string;
  is_sub_module_completed: boolean;
  sub_module_in_module_id: number;
}

export const createData = async (
  data: ModuleDataForCourse[],
  courseModuleIds: number[],
) => {
  let setupModule = data?.[0].Module;
  let module_index = 0;
  let module_id = courseModuleIds[module_index];

  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if (element.Module === setupModule) {
      await db.insert(subModules).values({
        sub_module_title: element?.Sub_Module,
        is_sub_module_completed: false,
        sub_module_in_module_id: module_id,
      });
    } else {
      setupModule = element?.Module;
      module_index += 1;
      module_id = courseModuleIds[module_index];
    }
  }
};

export const arrangeData = async (data: ModuleAndSubModuleDetails[]) => {
  if (!data.length) return [];

  let setupModuleId = data[0].module_id;

  let subModulesObjects: subModuleObjectData = {
    module_id: data[0].module_id,
    module_name: data[0].module_name,
    course_id_for_module: data?.[0]?.course_id_for_module ?? 0,
    is_module_complete: data[0].is_module_complete ?? false,
    sub_modules: [],
  };

  let totalModulesData: subModuleObjectData[] = [];

  for (let index = 0; index < data.length; index++) {
    const element = data[index];

    if (element.module_id === setupModuleId) {
      subModulesObjects.sub_modules.push({
        sub_module_id: element.sub_module_id ?? 0,
        sub_module_title: element.sub_module_title ?? "",
        is_sub_module_completed: element.is_sub_module_completed ?? false,
        sub_module_in_module_id: element.sub_module_in_module_id ?? 0,
      });
    } else {
      // push previous module
      totalModulesData.push({ ...subModulesObjects });

      // reset for new module
      setupModuleId = element.module_id;

      subModulesObjects = {
        module_id: element.module_id,
        module_name: element.module_name,
        course_id_for_module: element.course_id_for_module ?? 0,
        is_module_complete: element.is_module_complete ?? false,
        sub_modules: [
          {
            sub_module_id: element.sub_module_id ?? 0,
            sub_module_title: element.sub_module_title ?? "",
            is_sub_module_completed: element.is_sub_module_completed ?? false,
            sub_module_in_module_id: element.sub_module_in_module_id ?? 0,
          },
        ],
      };
    }
  }

  totalModulesData.push({ ...subModulesObjects });

  return totalModulesData;
};