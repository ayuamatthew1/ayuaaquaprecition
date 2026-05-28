
interface dataType {
    temperature: number;
    ph: number;
    dissolvedOxygen:number;
    turbidity: number;
    ammonia: number;
    timestamp: Date;
}


export function predictWaterQuality(data: dataType) {

  const alertAndRecomm = [];


  if (data.temperature > 30) {
    const res ={
      alert: 'High water temperature detected',
      recommendations: 'Increase aeration and reduce sunlight exposure.'
    }
      alertAndRecomm.push(res)
  }

  if (data.ph < 6.5 || data.ph > 8.5) {
    
    const res ={
      alert: 'Unsafe pH level detected',
      recommendations: 'Adjust pH gradually using approved hatchery buffers.'
    }
      alertAndRecomm.push(res)
  }

  if (data.dissolvedOxygen < 5) {
     const res ={
      alert: 'Low dissolved oxygen detected',
      recommendations: 'Activate aerators immediately.'
    }
      alertAndRecomm.push(res)
  }

  if (data.ammonia > 0.02) {
      const res ={
      alert: 'Dangerous ammonia concentration detected',
      recommendations: 'Perform partial water exchange and reduce feeding temporarily.'
    }
      alertAndRecomm.push(res)
  }

  if (data.turbidity > 25) {
     const res ={
      alert: 'High turbidity detected',
      recommendations: 'Clean filters and inspect organic waste accumulation.'
    }
      alertAndRecomm.push(res)
  }

  return alertAndRecomm;
}