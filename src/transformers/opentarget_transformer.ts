import BaseTransformer from "./transformer";


export default class OpenTargetTransformer extends BaseTransformer {
    wrap(res) {
        for (const disease of res.data.target.associatedDiseases.rows) {
            disease.disease.evidences.rows = disease.disease.evidences.rows.filter(r => r.drug != null);
            disease.disease.evidences.rows = disease.disease.evidences.rows.map(r => ({drug: { ...r.drug, id: r.drug.id.replace("CHEMBL", "") }}))
        }
        return res;
    }
}
