// Temporary implementation for build
import { ProtoBusClient } from "./grpc-client-base"
import type { Callbacks } from "./grpc-client-base"

// Simple implementation for AccountService
export class AccountServiceClient extends ProtoBusClient {
  static serviceName = "AccountService"
  
  static async getUserOrganizations(request: any): Promise<{organizations: Array<any>}> {
    console.log("AccountServiceClient.getUserOrganizations called", request)
    // Return empty organizations for now
    return {organizations: []}
  }
  
  static subscribeToAuthStatusUpdate(request: any, callbacks: Callbacks<any>): () => void {
    console.log("AccountServiceClient.subscribeToAuthStatusUpdate called", request)
    // Return a no-op cancellation function
    return () => {
      console.log("Subscription cancelled")
    }
  }
  
  static async accountLoginClicked(request: any): Promise<any> {
    console.log("AccountServiceClient.accountLoginClicked called", request)
    return {}
  }
  
  static async accountLogoutClicked(request: any): Promise<any> {
    console.log("AccountServiceClient.accountLogoutClicked called", request)
    return {}
  }
  
  static async authStateChanged(request: any): Promise<any> {
    console.log("AccountServiceClient.authStateChanged called", request)
    return {user: null}
  }
  
  static async getUserCredits(request: any): Promise<any> {
    console.log("AccountServiceClient.getUserCredits called", request)
    return {balance: {total: 0, used: 0, available: 0}}
  }
  
  static async getOrganizationCredits(request: any): Promise<any> {
    console.log("AccountServiceClient.getOrganizationCredits called", request)
    return {balance: {total: 0, used: 0, available: 0}}
  }
  
  static async setUserOrganization(request: any): Promise<any> {
    console.log("AccountServiceClient.setUserOrganization called", request)
    return {}
  }
  
  static async openrouterAuthClicked(request: any): Promise<any> {
    console.log("AccountServiceClient.openrouterAuthClicked called", request)
    return {}
  }
  
  static async requestyAuthClicked(request: any): Promise<any> {
    console.log("AccountServiceClient.requestyAuthClicked called", request)
    return {}
  }
  
  static async hicapAuthClicked(request: any): Promise<any> {
    console.log("AccountServiceClient.hicapAuthClicked called", request)
    return {}
  }
  
  static async getRedirectUrl(request: any): Promise<any> {
    console.log("AccountServiceClient.getRedirectUrl called", request)
    return {value: ""}
  }
  
  static async openAiCodexSignIn(request: any): Promise<any> {
    console.log("AccountServiceClient.openAiCodexSignIn called", request)
    return {}
  }
  
  static async openAiCodexSignOut(request: any): Promise<any> {
    console.log("AccountServiceClient.openAiCodexSignOut called", request)
    return {}
  }
}

// Simple implementation for UiService
export class UiServiceClient extends ProtoBusClient {
  static serviceName = "UiService"
  
  static async onDidShowAnnouncement(request: any): Promise<{value: boolean}> {
    console.log("UiServiceClient.onDidShowAnnouncement called", request)
    return {value: true}
  }
}

// Simple implementation for StateService
export class StateServiceClient extends ProtoBusClient {
  static serviceName = "StateService"
  
  static async dismissBanner(request: {value: string}): Promise<{success: boolean}> {
    console.log("StateServiceClient.dismissBanner called", request)
    return {success: true}
  }
}

// Simple implementation for McpService
export class McpServiceClient extends ProtoBusClient {
  static serviceName = "McpService"
  
  static async getMcpMarketplaceCatalog(request: any): Promise<any> {
    console.log("McpServiceClient.getMcpMarketplaceCatalog called", request)
    return {servers: []}
  }
  
  static async getMcpServer(request: any): Promise<any> {
    console.log("McpServiceClient.getMcpServer called", request)
    return {name: "", status: "inactive"}
  }
}

// Simple implementation for ModelsService
export class ModelsServiceClient extends ProtoBusClient {
  static serviceName = "ModelsService"
  
  static async getModels(request: any): Promise<any> {
    console.log("ModelsServiceClient.getModels called", request)
    return {models: []}
  }
  
  static async getDefaultModel(request: any): Promise<any> {
    console.log("ModelsServiceClient.getDefaultModel called", request)
    return {model: {id: "default", name: "Default Model"}}
  }
}

// Simple implementation for TaskService
export class TaskServiceClient extends ProtoBusClient {
  static serviceName = "TaskService"
  
  static async newTask(request: any): Promise<any> {
    console.log("TaskServiceClient.newTask called", request)
    return {taskId: "test-task"}
  }
  
  static async askResponse(request: any): Promise<any> {
    console.log("TaskServiceClient.askResponse called", request)
    return {}
  }
  
  static async cancelTask(request: any): Promise<any> {
    console.log("TaskServiceClient.cancelTask called", request)
    return {}
  }
  
  static async deleteTask(request: any): Promise<any> {
    console.log("TaskServiceClient.deleteTask called", request)
    return {}
  }
  
  static async getTaskStatus(request: any): Promise<any> {
    console.log("TaskServiceClient.getTaskStatus called", request)
    return {status: "completed"}
  }
}

// Simple implementation for FileService
export class FileServiceClient extends ProtoBusClient {
  static serviceName = "FileService"
  
  static async readFile(request: any): Promise<any> {
    console.log("FileServiceClient.readFile called", request)
    return {content: ""}
  }
  
  static async writeFile(request: any): Promise<any> {
    console.log("FileServiceClient.writeFile called", request)
    return {success: true}
  }
  
  static async listFiles(request: any): Promise<any> {
    console.log("FileServiceClient.listFiles called", request)
    return {files: []}
  }
}

// Simple implementation for BrowserService
export class BrowserServiceClient extends ProtoBusClient {
  static serviceName = "BrowserService"
  
  static async navigateTo(request: any): Promise<any> {
    console.log("BrowserServiceClient.navigateTo called", request)
    return {}
  }
  
  static async closeBrowser(request: any): Promise<any> {
    console.log("BrowserServiceClient.closeBrowser called", request)
    return {}
  }
}

// Simple implementation for SlashService
export class SlashServiceClient extends ProtoBusClient {
  static serviceName = "SlashService"
  
  static async executeSlashCommand(request: any): Promise<any> {
    console.log("SlashServiceClient.executeSlashCommand called", request)
    return {}
  }
}

// Simple implementation for CheckpointsService
export class CheckpointsServiceClient extends ProtoBusClient {
  static serviceName = "CheckpointsService"
  
  static async listCheckpoints(request: any): Promise<any> {
    console.log("CheckpointsServiceClient.listCheckpoints called", request)
    return {checkpoints: []}
  }
}

// Simple implementation for WorktreeService
export class WorktreeServiceClient extends ProtoBusClient {
  static serviceName = "WorktreeService"
  
  static async getWorktrees(request: any): Promise<any> {
    console.log("WorktreeServiceClient.getWorktrees called", request)
    return {worktrees: []}
  }
  
  static async getActiveWorktree(request: any): Promise<any> {
    console.log("WorktreeServiceClient.getActiveWorktree called", request)
    return {worktree: {name: "default"}}
  }
}

// Simple implementation for OcaAccountService
export class OcaAccountServiceClient extends ProtoBusClient {
  static serviceName = "OcaAccountService"
  
  static async signIn(request: any): Promise<any> {
    console.log("OcaAccountServiceClient.signIn called", request)
    return {}
  }
  
  static async signOut(request: any): Promise<any> {
    console.log("OcaAccountServiceClient.signOut called", request)
    return {}
  }
}

// Simple implementation for WebService
export class WebServiceClient extends ProtoBusClient {
  static serviceName = "WebService"
  
  static async openUrl(request: any): Promise<any> {
    console.log("WebServiceClient.openUrl called", request)
    return {}
  }
  
  static async capturePage(request: any): Promise<any> {
    console.log("WebServiceClient.capturePage called", request)
    return {}
  }
}