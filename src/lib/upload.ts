import { UTApi } from "uploadthing/server";

class UTApiInstance {
  private static instance: UTApiInstance;
  private utapi: UTApi;

  private constructor() {
    this.utapi = new UTApi();
  }

  public static getInstance(): UTApiInstance {
    if (!this.instance) {
      this.instance = new UTApiInstance();
    }
    return this.instance;
  }

  public getUTApi(): UTApi {
    return this.utapi;
  }
}

export const utapi: UTApi = UTApiInstance.getInstance().getUTApi();
