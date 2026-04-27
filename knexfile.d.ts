export namespace development {
    let client: string;
    let connection: string;
    namespace pool {
        let min: number;
        let max: number;
    }
    namespace migrations {
        let directory: string;
        let tableName: string;
    }
    namespace seeds {
        let directory_1: string;
        export { directory_1 as directory };
    }
}
export namespace test {
    let client_1: string;
    export { client_1 as client };
    let connection_1: string;
    export { connection_1 as connection };
    export namespace pool_1 {
        let min_1: number;
        export { min_1 as min };
        let max_1: number;
        export { max_1 as max };
    }
    export { pool_1 as pool };
    export namespace migrations_1 {
        let directory_2: string;
        export { directory_2 as directory };
    }
    export { migrations_1 as migrations };
    export namespace seeds_1 {
        let directory_3: string;
        export { directory_3 as directory };
    }
    export { seeds_1 as seeds };
}
export namespace production {
    let client_2: string;
    export { client_2 as client };
    let connection_2: string | undefined;
    export { connection_2 as connection };
    export namespace pool_2 {
        let min_2: number;
        export { min_2 as min };
        let max_2: number;
        export { max_2 as max };
    }
    export { pool_2 as pool };
    export namespace migrations_2 {
        let directory_4: string;
        export { directory_4 as directory };
    }
    export { migrations_2 as migrations };
}
//# sourceMappingURL=knexfile.d.ts.map