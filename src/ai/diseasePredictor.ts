
interface dataType {
    temperature: number;
    ph: number;
    dissolvedOxygen:number;
    turbidity: number;
    ammonia: number;
    timestamp: Date;
}



export function predictDiseaseRisk(data: dataType) {
  let riskLevel = 'LOW';
  let possibleDiseases = [];
  let solutions = [];

  if (
    data.temperature > 31 &&
    data.dissolvedOxygen < 4
  ) {
    riskLevel = 'HIGH';

    possibleDiseases.push(
      'Bacterial infection risk increased'
    );

    solutions.push(
      'Reduce stocking density and improve aeration.'
    );
  }

  if (data.ammonia > 0.03) {
    riskLevel = 'HIGH';

    possibleDiseases.push(
      'Gill damage and ammonia toxicity risk detected'
    );

    solutions.push(
      'Immediate water replacement required.'
    );
  }

  return {
    riskLevel,
    possibleDiseases,
    solutions,
  };
}