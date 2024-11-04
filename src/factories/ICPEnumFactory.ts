export abstract class ICPEnumFactory<T, E> {
    public abstract fromICPType(value: T): E;

    public abstract toICPType(value: E): T;
}
