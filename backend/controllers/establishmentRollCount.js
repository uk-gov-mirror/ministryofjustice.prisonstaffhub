const getEstablishmentRollCountFactory = (elite2Api) => {
  const getEstablishmentRollCount = async (context, agencyId) => {
    const response = await elite2Api.getEstablishmentRollCount(context, agencyId);
    const getTotals = (array, figure) => {
      return array.reduce((accumulator, block) => accumulator + (block[figure] || 0), 0);
    };

    const blocks = response.map((block) => ({
      name: block.livingUnitDesc,
      numbers: [
        { name: 'Beds in use', value: block.bedsInUse || 0 },
        { name: 'Currently in cell', value: block.currentlyInCell || 0 },
        { name: 'Currently out', value: block.currentlyOut || 0 },
        { name: 'Operational cap.', value: block.operationalCapacity || 0 },
        { name: 'Net vacancies', value: block.netVacancies || 0 },
        { name: 'Out of order', value: block.outOfOrder || 0 }
      ]
    }));

    const totals = {
      name: 'Totals',
      numbers: [
        { name: 'Total roll', value: getTotals(response, 'bedsInUse') },
        { name: 'Total in cell', value: getTotals(response, 'currentlyInCell') },
        { name: 'Total out', value: getTotals(response, 'currentlyOut') },
        { name: 'Total op. cap.', value: getTotals(response, 'operationalCapacity') },
        { name: 'Total vacancies', value: getTotals(response, 'netVacancies') },
        { name: 'Total out of order', value: getTotals(response, 'outOfOrder') }
      ]
    };

    return { blocks, totals };
  };

  return {
    getEstablishmentRollCount
  };
};

module.exports = {
  getEstablishmentRollCountFactory
};
