module.exports = function () {
  return async function getAvailableStateMachines (event, env) {
    const availableStateMachines = env.bootedServices.statebox
      .listStateMachines()
      .map(({ name }) => {
        return {
          title: name,
          value: name
        }
      })

    return {
      availableStateMachines,
      availableStateMachinesOrig: availableStateMachines,
      availableStateMachinesFilt: availableStateMachines
    }
  }
}
