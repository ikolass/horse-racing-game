const horses = {
  namespaced: true,
  state: () => ({
    list: [
      { name: 'Thunder',   color: '#E53935', condition: 78 },
      { name: 'Eclipse',   color: '#D81B60', condition: 45 },
      { name: 'Storm',     color: '#8E24AA', condition: 92 },
      { name: 'Blaze',     color: '#5E35B1', condition: 61 },
      { name: 'Phantom',   color: '#3949AB', condition: 34 },
      { name: 'Comet',     color: '#1E88E5', condition: 87 },
      { name: 'Arrow',     color: '#039BE5', condition: 53 },
      { name: 'Vortex',    color: '#00ACC1', condition: 29 },
      { name: 'Titan',     color: '#00897B', condition: 95 },
      { name: 'Mustang',   color: '#43A047', condition: 68 },
      { name: 'Shadow',    color: '#7CB342', condition: 42 },
      { name: 'Lightning', color: '#C0CA33', condition: 76 },
      { name: 'Pegasus',   color: '#FFB300', condition: 58 },
      { name: 'Bullet',    color: '#FB8C00', condition: 83 },
      { name: 'Inferno',   color: '#F4511E', condition: 37 },
      { name: 'Cyclone',   color: '#6D4C41', condition: 71 },
      { name: 'Falcon',    color: '#546E7A', condition: 49 },
      { name: 'Neptune',   color: '#EC407A', condition: 90 },
      { name: 'Ranger',    color: '#26A69A', condition: 64 },
      { name: 'Spirit',    color: '#AB47BC', condition: 55 },
    ],
  }),
  getters: {
    allHorses: (state) => state.list,
    horseByIndex: (state) => (index) => state.list[index],
  },
};

export default horses;
