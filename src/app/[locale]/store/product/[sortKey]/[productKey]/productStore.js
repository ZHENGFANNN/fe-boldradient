import { create } from "zustand";

const useProductStore = create((set) => ({
  // 产品数量
  productNum: 1,
  setProductNum: (productNum) => set({ productNum }),
  // 当前产品选项
  productOptions: [],
  setProductOptions: (newItem) =>
    set((state) => ({
      productOptions: state.productOptions.some(
        (item) => item.name === newItem.name
      )
        ? state.productOptions.map((item) =>
            item.name === newItem.name ? newItem : item
          )
        : [...state.productOptions, newItem],
    })),
  // 当前产品套餐
  productCurCombo: { areaInfo: {} },
  setProductCurCombo: (productCurCombo) => set({ productCurCombo }),
  // 当前展示类型
  productShowType: "image",
  setProductShowType: (productShowType) => set({ productShowType }),
}));

export default useProductStore;
