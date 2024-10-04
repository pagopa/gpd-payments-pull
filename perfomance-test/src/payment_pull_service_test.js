import { getToService } from "./modules/payment_pull_client.js";
import { postToGPD, deleteToGPD } from "./modules/gpd_client.js";
import { buildDebtPositionComplex } from "./modules/util.js";
import { SharedArray } from 'k6/data';
import { check } from 'k6';

// 1. init code
const varsArray = new SharedArray('vars', function () {
    return JSON.parse(open(`./${__ENV.VARS}`)).environment;
});
export const ENV_VARS = varsArray[0];

const paymentsPullServiceURIBasePath = `${ENV_VARS.paymentsPullServiceURIBasePath}`;
const gpdURIBasePath = `${ENV_VARS.gpdURIBasePath}`;
const userTaxCode = `${ENV_VARS.userTaxCode}`;
const organizationTaxCode = `${ENV_VARS.organizationTaxCode}`;
const iupd = "payment-pull-performance-tests-debt-position";

export async function setup() {
    // 2. setup code
    await deleteToGPD(`${gpdURIBasePath}/organizations/${organizationTaxCode}/debtpositions/${iupd}`);
    let response = await postToGPD(`${gpdURIBasePath}/organizations/${organizationTaxCode}/debtpositions`, buildDebtPositionComplex(iupd, organizationTaxCode, userTaxCode));
    check(response, {
        'Create debt position to be retrieved status is 200': () => response.status === 200
    });
}

export default function () {
    // 3. VU code
    let response = getToService(`${paymentsPullServiceURIBasePath}/payment-notices/v1`, userTaxCode);
    console.info(`Payment Pull Service getPaymentNotices status ${response.status}`);

    let responseBody = JSON.parse(response.body);

    check(response, {
        'Payment Pull Service getPaymentNotices status is 200': () => response.status === 200,
        'Payment Pull Service getPaymentNotices body has list of payment notices': () =>
            Boolean(responseBody && responseBody.length && responseBody.length === 1)
    });
}

export async function teardown(data) {
    // 4. teardown code
    await deleteToGPD(`${gpdURIBasePath}/organizations/${organizationTaxCode}/debtpositions/${iupd}`);
}