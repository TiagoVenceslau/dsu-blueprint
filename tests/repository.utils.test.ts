import {TestIdDsuBlueprint} from "../src/tests";
import {splitDSUDecorators, groupDecorators} from "../src";

describe(`Decorator Splitting and Grouping`, function(){

    const data = {
        name: "test",
        email: "email@email.com"
    }
    const otherData = Object.assign({}, data, {
        environment: {
            property: "test"
        }
    });

    let testModel: TestIdDsuBlueprint;

    beforeEach(() => {
        testModel = new TestIdDsuBlueprint(otherData);
    })

    it(`Groups Decorators properly`, function(){

        const splitDecorators = splitDSUDecorators(testModel)
        expect(splitDecorators).toBeDefined();
        if (!splitDecorators)
            return;
        expect(splitDecorators.editing).toBeDefined();
        if (!splitDecorators.editing)
            return;
        const groupedDecorators = groupDecorators(testModel, splitDecorators.editing);

        expect(groupedDecorators).toBeDefined()

    });
});