export const useAppDispatch = () => () => undefined;
export const useAppSelector = <TSelected>(selector: (state: any) => TSelected) => selector({});
