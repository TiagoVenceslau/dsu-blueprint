import {getOpenDSU} from "../../demo-repositories/lib";

describe(`Type Script Workspace test`, function(){
    it(`Tests Belong in the dsu-blueprint-workspace repository`, function(){
        try{
            getOpenDSU()
        } catch (e) {
            expect(e).toBeDefined();
        }
        expect(1).toBe(1);
    });
});