export interface queryParams {
  page: number;
  limit: number;
  search: string;
}

export type Pagination = {
  pages: number;
  total_records: number;
  page_no: number;
  limit: number;
};

export interface TokenType {
  access_token: string;
  refresh_token: string;
}

export interface UserRegisterForm {
  name: string;
  email: string;
  password: string;
  collegeId: number;
  branchName: string;
  domainId: number;
  rollNo: string;
  courseId: number;
}
