export interface ModuleDataForCourse {
  Module: string;
  Sub_Module: string;
}

export interface SubModuleArrayType {
  Module: string;
  sub_modules: string[];
}

export interface ModuleAndSubModuleDetails {
  module_id: number;
  module_name: string;
  course_id_for_module: number | null;
  is_module_complete: boolean | null;
  sub_module_id: number | null;
  sub_module_title: string | null;
  is_sub_module_completed: boolean | null;
  sub_module_in_module_id: number | null;
}

export interface subModuleObjectData {
  module_id: number;
  module_name: string;
  course_id_for_module: number;
  is_module_complete: boolean;
  sub_modules: SubModuleDetails[];
}

export interface SubModuleDetails {
  sub_module_id: number;
  sub_module_title: string;
  is_sub_module_completed: boolean;
  sub_module_in_module_id: number;
}