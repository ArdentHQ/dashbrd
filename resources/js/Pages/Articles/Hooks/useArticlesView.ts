import { type DisplayTypes } from "@/Components/DisplayType";
import { type ArticleSortBy } from "@/Pages/Collections/Components/Articles/ArticleSortDropdown";

export enum ArticlesViewActionTypes {
    SetQuery = "SetQuery",
    SetPageLimit = "SetPageLimit",
    SetDisplayType = "SetDisplayType",
    SetFilterDirty = "SetFilterDirty",
    SetSort = "SetSort",
    SetPage = "SetPage",
}

type ArticlesViewActions =
    | { type: ArticlesViewActionTypes.SetQuery; payload: string }
    | { type: ArticlesViewActionTypes.SetPageLimit; payload: number }
    | { type: ArticlesViewActionTypes.SetDisplayType; payload: DisplayTypes }
    | { type: ArticlesViewActionTypes.SetFilterDirty; payload: boolean }
    | { type: ArticlesViewActionTypes.SetSort; payload: ArticleSortBy }
    | { type: ArticlesViewActionTypes.SetPage; payload: number };

interface ArticlesViewState {
    query: string;
    pageLimit: number;
    displayType: DisplayTypes;
    isFilterDirty: boolean;
    sort: ArticleSortBy;
    page: number;
}

export const articlesViewReducer = (state: ArticlesViewState, action: ArticlesViewActions): ArticlesViewState => {
    switch (action.type) {
        case ArticlesViewActionTypes.SetQuery:
            return { ...state, query: action.payload, page: 1, isFilterDirty: true };
        case ArticlesViewActionTypes.SetPageLimit:
            return { ...state, pageLimit: action.payload, page: 1, isFilterDirty: true };
        case ArticlesViewActionTypes.SetDisplayType:
            return { ...state, displayType: action.payload };
        case ArticlesViewActionTypes.SetFilterDirty:
            return { ...state, isFilterDirty: action.payload };
        case ArticlesViewActionTypes.SetSort:
            return { ...state, sort: action.payload, page: 1, isFilterDirty: true };
        case ArticlesViewActionTypes.SetPage:
            return { ...state, page: action.payload, isFilterDirty: true };
        default:
            return state;
    }
};
