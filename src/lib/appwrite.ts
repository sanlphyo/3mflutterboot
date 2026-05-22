import { Client, Account, Databases } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';

const client = new Client();

if (typeof window !== 'undefined') {
  // Safe execution client-side or server-side
  client.setEndpoint(endpoint).setProject(projectId);
} else {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);

// Appwrite Database Config
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || '';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '';
export const CLASS_PROGRESS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CLASS_PROGRESS_COLLECTION_ID || '';
export const CURRICULUM_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CURRICULUM_COLLECTION_ID || '';
export const SESSIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID || '';


export default client;
