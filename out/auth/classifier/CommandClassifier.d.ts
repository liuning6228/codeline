/**
 * 命令分类器
 * 使用机器学习或规则对命令进行智能分类和风险评估
 */
/**
 * 分类结果
 */
export interface ClassificationResult {
    /** 命令类型 */
    type: string;
    /** 风险等级 (0-10) */
    riskLevel: number;
    /** 置信度 (0-1) */
    confidence: number;
    /** 是否只读 */
    readOnly: boolean;
    /** 建议的权限动作 */
    suggestedAction: 'allow' | 'deny' | 'ask';
    /** 解释 */
    explanation: string;
    /** 关键词 */
    keywords: string[];
    /** 建议的沙箱级别 */
    sandboxLevel: 'none' | 'low' | 'medium' | 'high';
}
/**
 * 命令分类器
 */
export declare class CommandClassifier {
    private model;
    private rules;
    constructor();
    /**
     * 分类命令
     */
    classify(command: string, context?: any): Promise<ClassificationResult>;
    /**
     * 批量分类
     */
    classifyBatch(commands: string[], context?: any): Promise<ClassificationResult[]>;
    /**
     * 训练分类器
     */
    train(trainingData: Array<{
        command: string;
        label: string;
        riskLevel: number;
    }>): Promise<void>;
    /**
     * 评估分类器性能
     */
    evaluate(testData: Array<{
        command: string;
        label: string;
        riskLevel: number;
    }>): Promise<{
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    }>;
    /**
     * 添加自定义规则
     */
    addRule(pattern: RegExp | string, type: string, riskLevel: number, readOnly?: boolean, action?: 'allow' | 'deny' | 'ask', sandboxLevel?: 'none' | 'low' | 'medium' | 'high'): void;
    /**
     * 清除所有规则
     */
    clearRules(): void;
    /**
     * 获取所有规则
     */
    getRules(): Array<{
        pattern: string;
        type: string;
        riskLevel: number;
        readOnly: boolean;
        action: string;
        sandboxLevel: string;
    }>;
    private initializeRules;
    private loadModel;
    private matchRules;
    private classifyWithModel;
    private defaultClassification;
    private addRuleFromTraining;
    private createPatternFromCommand;
    private extractKeywords;
}
/**
 * 创建命令分类器实例
 */
export declare function createCommandClassifier(): CommandClassifier;
//# sourceMappingURL=CommandClassifier.d.ts.map