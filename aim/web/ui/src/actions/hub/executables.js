import callApi from '../../services/api';

export function executeExecutable(params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.executeExecutable', params)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function hideExecutable(executable_id, params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.hideExecutable', { executable_id, ...params })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function createExecutable(params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.newExecutable', params)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getExecutables() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.getExecutables')
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getRunningExecutables() {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.getRunningExecutables')
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function killRunningExecutable(pid) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.killRunningExecutable', { pid })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function executeExecutableTemplate(executable_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.executeExecutableTemplate', { executable_id })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getExecutable(executable_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.getExecutable', { executable_id })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function saveExecutable(executable_id, params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.saveExecutable', { executable_id, ...params })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function executeExecutableForm(executable_id, params) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.executeExecutableTemplateForm', {
        executable_id,
        ...params,
      })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}

export function getExecutableProcess(process_id) {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      callApi('Executable.getExecutableProcess', { process_id })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
