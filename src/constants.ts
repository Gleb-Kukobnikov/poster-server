const __prod__: boolean = process.env.NODE_ENV !== 'production';

enum POSTGRES_ERRORS {
    DUPLICATE_KEY_VAL = '23505'
}

export {
    __prod__,
    POSTGRES_ERRORS
};
