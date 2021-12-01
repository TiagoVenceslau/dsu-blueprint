import {getOpenDSU} from "../src";

describe(`DSU Blueprint`, function(){
    it(`Tests Belong in the dsu-blueprint-workspace repository`, function(){
        try{
            getOpenDSU()
        } catch (e) {
            expect(e).toBeDefined();
        }
    });
});