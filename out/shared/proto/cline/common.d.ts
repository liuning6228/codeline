export interface EmptyRequest {
}
export declare const EmptyRequest: {
    create: () => EmptyRequest;
};
export interface StringRequest {
    value: string;
}
export declare const StringRequest: {
    create: (value: string) => StringRequest;
};
export interface BooleanRequest {
    value: boolean;
}
export declare const BooleanRequest: {
    create: (value: boolean) => BooleanRequest;
};
export interface Int64Request {
    value: number;
}
export declare const Int64Request: {
    create: (value: number) => Int64Request;
};
export interface KeyValuePair {
    key: string;
    value: string;
}
export declare const KeyValuePair: {
    create: (key: string, value: string) => KeyValuePair;
};
export interface State {
    [key: string]: any;
}
export declare const State: {
    create: (data: any) => State;
};
export interface StringArrayRequest {
    values: string[];
}
export declare const StringArrayRequest: {
    create: (values: string[]) => StringArrayRequest;
};
//# sourceMappingURL=common.d.ts.map