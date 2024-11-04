import localReducer, {
    initialState,
    setActive,
    setApplications,
} from "../../../ducks/modes/local";
import {
    RECEIVE as STATE_RECEIVE,
    BackendState,
} from "../../../ducks/backendState";
import { TStore } from "../tutils";
import fetchMock, { enableFetchMocks } from "jest-fetch-mock";
import { PayloadAction } from "@reduxjs/toolkit";

describe("localSlice", () => {
    it("should have working setters", async () => {
        enableFetchMocks();
        const store = TStore();

        expect(store.getState().modes.local[0]).toEqual({
            active: false,
            applications: "",
        });

        const server = store.getState().modes.local[0];
        await store.dispatch(setActive({ value: true, server }));
        await store.dispatch(setApplications({ value: "curl", server }));

        expect(store.getState().modes.local[0]).toEqual({
            active: true,
            applications: "curl",
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should handle error when setting local mode", async () => {
        fetchMock.mockReject(new Error("invalid spec"));
        const store = TStore();

        const server = store.getState().modes.local[0];
        await store.dispatch(setActive({ value: true, server }));

        expect(fetchMock).toHaveBeenCalled();
        expect(store.getState().modes.local[0].error).toBe("invalid spec");
    });

    it("should handle error when setting applications", async () => {
        fetchMock.mockReject(new Error("invalid spec"));
        const store = TStore();

        const server = store.getState().modes.local[0];
        await store.dispatch(setApplications({ value: "curl", server }));

        expect(fetchMock).toHaveBeenCalled();
        expect(store.getState().modes.local[0].error).toBe("invalid spec");
    });

    it("should handle RECEIVE_STATE with an active local proxy", () => {
        const action = {
            type: STATE_RECEIVE.type,
            payload: {
                servers: {
                    "local:curl": {
                        description: "Local redirector",
                        full_spec: "local:curl",
                        is_running: true,
                        last_exception: null,
                        listen_addrs: [],
                        type: "local",
                    },
                },
            },
        } as PayloadAction<Partial<BackendState>>;
        const newState = localReducer(initialState, action);
        expect(newState).toEqual([
            {
                active: true,
                applications: "curl",
                ui_id: newState[0].ui_id,
            },
        ]);
    });

    it("should handle RECEIVE_STATE with no active local proxy", () => {
        const action = {
            type: STATE_RECEIVE.type,
            payload: {
                servers: {},
            },
        } as PayloadAction<Partial<BackendState>>;
        const newState = localReducer(initialState, action);
        expect(newState).toEqual([
            {
                active: false,
                applications: "",
                ui_id: newState[0].ui_id,
            },
        ]);
    });
});
