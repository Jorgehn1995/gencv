import type { Timestamp } from "firebase/firestore";
export interface User {
  uid: string | null;
  name: string | null;
  email: string | null;
  photo: string | null;
}

export interface AppFile {
  id: string;
  name: string;
  url: string;
  path: string;
  size?: number;
  category: string;
  updatedAt: Timestamp | null;
}
export interface Person {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  aboutMe: string;
}
export interface Job {
  title: string;
  company: string;
  description: string;
  salaryExpectation?: string;
  salary?: string;
}
export interface Cv {
  id: string;
  userId: string;
  job: Job;
  person: Person;
  cvFileUrl: string;
  cvContentUrl: string;
  createdAt: number;
}

export interface NewCv {
  cvFile: File | null;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

export type User = AppTypes.User;
export type AppFile = AppTypes.AppFile;
export type NewAppFile = Omit<AppFile, "id" | "updatedAt">;
