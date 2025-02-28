// Use global React and ReactDOM exposed from index.html
const { useState, useEffect, useReducer, useContext, createContext } = window.React;
const ReactDOM = window.ReactDOM;

const createRoot = ReactDOM.createRoot || ReactDOM.render;

const tasksData = {
  engine: [
    { name: 'Check Oil Level', type: 'maintenance', price: 35, unit: 'jobs', part: 'engine' },
    { name: 'Inspect Belts', type: 'inspection', price: 22.5, unit: 'jobs', part: 'engine' },
  ],
  fuel: [
    { name: 'Refill Tank', type: 'maintenance', price: 17.5, unit: 'jobs', part: 'fuel' },
    { name: 'Replace Filter', type: 'repair', price: 75, unit: 'jobs', part: 'fuel' },
  ],
  refill: [
    { name: 'Refill Engine Oil', type: 'refill', price: 5, unit: 'litres', part: 'refill' },
    { name: 'Refill Gear Oil', type: 'refill', price: 10, unit: 'litres', part: 'refill' },
  ],
};

const getTaskTypes = () => {
  const types = new Set();
  Object.values(tasksData).forEach(tasks => tasks.forEach(task => types.add(task.type)));
  return ['all', ...Array.from(types)];
};

const initializeCategoryBadges = (tasksData, serviceTasks) => {
  const parts = Object.keys(tasksData || {});
  const initialBadges = {};
  parts.forEach(part => {
    initialBadges[part] = serviceTasks.filter(t => t.part === part).length;
  });
  return initialBadges;
};

// Create Context
const ServiceContext = createContext();

// WorkshopService Class
class WorkshopService {
  constructor(jsonString = '{}') {
    const data = JSON.parse(jsonString);
    this.id = data.id || Date.now();
    this.vehicleNumber = data.vehicleNumber || '';
    this.serviceTasks = data.serviceTasks || [];
    this.spareParts = data.spareParts || [];
    this.createdDate = data.createdDate || new Date().toISOString();
  }

  static fromJson(jsonString) {
    return new WorkshopService(jsonString);
  }

  setVehicleNumber(vehicleNumber) {
    return new WorkshopService(JSON.stringify({ ...this.toJson(), vehicleNumber }));
  }

  setServiceTasks(serviceTasks) {
    return new WorkshopService(JSON.stringify({ ...this.toJson(), serviceTasks }));
  }

  addTask(task) {
    const newTasks = [...this.serviceTasks, { ...task, quantity: 1, remarks: '' }];
    return this.setServiceTasks(newTasks);
  }

  removeTask(taskName) {
    const newTasks = this.serviceTasks.filter(task => task.name !== taskName);
    return this.setServiceTasks(newTasks);
  }

  setSpareParts(spareParts) {
    return new WorkshopService(JSON.stringify({ ...this.toJson(), spareParts }));
  }

  addSparePart(sparePart) {
    const newSpareParts = [...this.spareParts, sparePart];
    return this.setSpareParts(newSpareParts);
  }

  removeSparePart(name) {
    const newSpareParts = this.spareParts.filter(sp => sp.name !== name);
    return this.setSpareParts(newSpareParts);
  }

  toJson() {
    return {
      id: this.id,
      vehicleNumber: this.vehicleNumber,
      serviceTasks: this.serviceTasks,
      spareParts: this.spareParts,
      createdDate: this.createdDate,
    };
  }

  calculateTotal() {
    return this.serviceTasks
      .reduce((sum, task) => sum + task.price * (task.quantity || 1), 0)
      .toFixed(2);
  }

  calculateSparePartsTotal() {
    return this.spareParts
      .reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0)
      .toFixed(2);
  }
}

const FilterSection = ({ filter, onFilterChange }) => (
  <div className="filter-section">
    {getTaskTypes().map(type => (
      <button
        key={type}
        className={`filter-btn ${filter === type ? 'active' : ''}`}
        onClick={() => onFilterChange(type)}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
      </button>
    ))}
  </div>
);

const Category = ({ part, filter, serviceTasks, onTaskClick, onRemoveTask, categoryBadges }) => (
  <div className="category-box">
    <div className="category-header">
      <div className="image-placeholder">
        <img src={`./images/${part}.png`} alt={`${part} Image Placeholder`} />
      </div>
      <div className="category-title">
        <h2>{part.charAt(0).toUpperCase() + part.slice(1)}</h2>
        <span className={`category-badge ${categoryBadges[part] === 0 ? 'category-badge-grey' : ''}`}>
          {categoryBadges[part] || 0}
        </span>
      </div>
    </div>
    <div className="tasks">
      {tasksData[part].map(task => (
        <TaskBox
          key={task.name}
          task={task}
          filter={filter}
          isSelected={serviceTasks.some(t => t.name === task.name)}
          onClick={() => onTaskClick(task)}
          onRemove={() => onRemoveTask(task.name)}
        />
      ))}
    </div>
  </div>
);

const TaskBox = ({ task, filter, isSelected, onClick, onRemove }) => (
  <div
    className={`task-box ${filter === 'all' || filter === task.type ? '' : 'hidden'} ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="task-image-placeholder">
      <img src="./images/task.png" alt="Task Image Placeholder" />
    </div>
    <span>{task.name}</span>
    <div className="price-tooltip">${task.price} per {task.unit}</div>
    {isSelected && (
      <button
        className="task-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

const TableView = ({ serviceTasks, onQuantityChange, onRemoveTask, calculateTotal, vehicleNumber }) => (
  <div className="table-view-wrapper">
    <div className="table-view-info">
      <span className="vehicle-number">Vehicle No: {vehicleNumber || 'Not specified'}</span>
      <span className="vehicle-date">Date: {new Date().toLocaleDateString()}</span>
    </div>
    <table className="tasks-table">
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Quantity</th>
          <th>Unit</th>
          <th>Subtotal</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {serviceTasks.map((task, index) => (
          <tr key={task.name + index}>
            <td>{task.name}</td>
            <td>
              <input
                type="number"
                min="1"
                value={task.quantity}
                onChange={(e) => onQuantityChange(task.name, e.target.value)}
                className="quantity-input"
              />
            </td>
            <td>{task.unit.charAt(0).toUpperCase() + task.unit.slice(1)}</td>
            <td>${(task.price * task.quantity).toFixed(2)}</td>
            <td>{task.remarks || '-'}</td>
            <td>
              <button className="remove-btn" onClick={() => onRemoveTask(task.name)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan="3">Total:</td>
          <td colSpan="3">${calculateTotal()}</td>
        </tr>
      </tfoot>
    </table>
  </div>
);

const Sidebar = ({ vehicleNumber, serviceTasks, onVehicleChange, onRemoveTask, onQuantityChange, onRemarksChange, calculateTotal, spareParts, calculateSparePartsTotal }) => (
  <div className="sidebar">
    <div className="sidebar-header">
      <div className="vehicle-input">
        <label htmlFor="vehicle-number">Vehicle No:</label>
        <input
          type="text"
          id="vehicle-number"
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChange={(e) => onVehicleChange(e.target.value)}
          className="quantity-input"
        />
      </div>
      <div className="header-row">
        <div className="labels-totals-container">
          <div className="label-total-pair">
            <h3>Workmanship</h3>
            <div className="total-item"><span className="top-total-amount">${calculateTotal()}</span></div>
          </div>
          {spareParts.length > 0 && (
            <div className="label-total-pair">
              <span className="subtotal-label">Spare Parts Subtotal</span>
              <div className="total-item"><span className="spare-parts-subtotal">${calculateSparePartsTotal()}</span></div>
            </div>
          )}
        </div>
        <div className="final-total-container">
          <div className="total-item total-final">
            Total: <span className="top-total-amount" style={{ marginLeft: 'auto', display: 'block' }}>${(parseFloat(calculateTotal()) + parseFloat(calculateSparePartsTotal() || 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="task-list">
      {serviceTasks.map((task, index) => (
        <SelectedTaskItem
          key={task.name + index}
          task={task}
          onQuantityChange={(newQuantity) => onQuantityChange(task.name, newQuantity)}
          onRemarksChange={(newRemarks) => onRemarksChange(task.name, newRemarks)}
          onRemove={() => onRemoveTask(task.name)}
        />
      ))}
    </div>
  </div>
);

const SelectedTaskItem = ({ task, onQuantityChange, onRemarksChange, onRemove }) => (
  <div className="selected-task-item">
    <div className="task-header">
      <span>{task.name}</span>
      <div className="job-input">
        <label>{task.unit.charAt(0).toUpperCase() + task.unit.slice(1)}</label>
        <input
          type="number"
          min="1"
          value={task.quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          className="quantity-input"
        />
      </div>
      <button className="remove-btn" onClick={onRemove}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div className="subtotal">Subtotal: ${(task.price * task.quantity).toFixed(2)}</div>
    <div className="task-remarks">
      <textarea
        placeholder="Add notes for this task..."
        value={task.remarks}
        onChange={(e) => onRemarksChange(e.target.value)}
      />
    </div>
  </div>
);

const SparePart = ({ addSparePart }) => {
  const [sparePartName, setSparePartName] = useState('');
  const [sparePartQuantity, setSparePartQuantity] = useState(1);
  const unitPrice = 10.00;

  const handleAddSparePart = () => {
    if (sparePartName.trim()) {
      addSparePart({ name: sparePartName, quantity: sparePartQuantity, unitPrice });
      setSparePartName('');
      setSparePartQuantity(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSparePart();
    }
  };

  return (
    <div className="spare-parts-section">
      <div className="spare-parts-inputs">
        <div className="spare-parts-label-container">
          <span className="spare-parts-label">Spare Parts</span>
        </div>
        <div className="spare-parts-inputs-container">
          <input
            type="text"
            value={sparePartName}
            onChange={(e) => setSparePartName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Spare part name (autocomplete soon)"
            className="quantity-input"
          />
          <input
            type="number"
            min="1"
            value={sparePartQuantity}
            onChange={(e) => setSparePartQuantity(parseInt(e.target.value) || 1)}
            onKeyPress={handleKeyPress}
            className="quantity-input"
          />
          <input
            type="text"
            value={`$${unitPrice.toFixed(2)}`}
            readOnly
            className="quantity-input"
          />
          <button className="button-primary" onClick={handleAddSparePart}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const SparePartsTable = ({ spareParts, removeSparePart, calculateSparePartsTotal, setSpareParts }) => {
  const handleQuantityChange = (index, value) => {
    const updatedSpareParts = spareParts.map((spare, i) =>
      i === index ? { ...spare, quantity: parseInt(value) || 1 } : spare
    );
    setSpareParts(updatedSpareParts);
  };

  return (
    <div className="spare-parts-table-section">
      <table className="spare-parts-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {spareParts.map((spare, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{spare.name}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  value={spare.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  className="quantity-input"
                  style={{ width: '100%' }}
                />
              </td>
              <td>${spare.unitPrice.toFixed(2)}</td>
              <td>${(spare.unitPrice * spare.quantity).toFixed(2)}</td>
              <td>
                <button className="remove-btn" onClick={() => removeSparePart(spare.name)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="1">Total:</td>
            <td></td>
            <td></td>
            <td></td>
            <td>${calculateSparePartsTotal()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const ServiceEntry = ({ onSave, onBack }) => {
  const { filter, serviceTasks, spareParts, vehicleNumber, categoryBadges, setFilter, setActiveView, handleTaskClick, handleRemoveTask, calculateTotal, setVehicleNumber, calculateSparePartsTotal, setServiceTasks, workshopService } = useContext(ServiceContext);

  const handleQuantityChange = (taskName, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    setServiceTasks(serviceTasks.map(task =>
      task.name === taskName ? { ...task, quantity } : task
    ));
  };

  const handleRemarksChange = (taskName, newRemarks) => {
    setServiceTasks(serviceTasks.map(task =>
      task.name === taskName ? { ...task, remarks: newRemarks } : task
    ));
  };

  const handleSaveAndBack = () => {
    onSave(workshopService.toJson());
    onBack();
  };

  return (
    <div className="app-container">
      <div className="service-entry-header">
        <div className="filter-section">
          {getTaskTypes().map(type => (
            <button
              key={type}
              className={`filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
            </button>
          ))}
        </div>
        <div className="service-entry-actions">
          <button className="button-primary" onClick={() => setActiveView('hub')}>
            Parts Hub
          </button>
          <button className="button-secondary" onClick={handleSaveAndBack}>
            Save & Back
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="categories">
          {Object.entries(tasksData).map(([part, tasks]) => (
            <Category
              key={part}
              part={part}
              filter={filter}
              serviceTasks={serviceTasks}
              onTaskClick={handleTaskClick}
              onRemoveTask={handleRemoveTask}
              categoryBadges={categoryBadges}
            />
          ))}
        </div>
        <Sidebar
          vehicleNumber={vehicleNumber}
          serviceTasks={serviceTasks}
          onVehicleChange={setVehicleNumber}
          onRemoveTask={handleRemoveTask}
          onQuantityChange={handleQuantityChange}
          onRemarksChange={handleRemarksChange}
          calculateTotal={calculateTotal}
          spareParts={spareParts}
          calculateSparePartsTotal={calculateSparePartsTotal}
        />
      </div>
    </div>
  );
};

const PartsHub = ({ onSave, onBack }) => {
  const { serviceTasks, vehicleNumber, setActiveView, handleQuantityChange, handleRemoveTask, calculateTotal, spareParts, addSparePart, removeSparePart, calculateSparePartsTotal, workshopService, setSpareParts } = useContext(ServiceContext);

  const handleSaveAndBack = () => {
    onSave(workshopService.toJson());
    onBack();
  };

  return (
    <div className="app-container">
      <div className="service-entry-header">
        <div className="filter-section">
          {getTaskTypes().map(type => (
            <button key={type} className={`filter-btn ${false ? 'active' : ''}`} disabled>
              {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
            </button>
          ))}
        </div>
        <div className="service-entry-actions">
          <button className="button-primary" onClick={() => setActiveView('entry')}>
            Workmanship Panel
          </button>
          <button className="button-secondary" onClick={handleSaveAndBack}>
            Save & Back
          </button>
        </div>
      </div>
      <div className="parts-hub-layout">
        <div className="table-view-wrapper">
          <TableView
            serviceTasks={serviceTasks}
            onQuantityChange={handleQuantityChange}
            onRemoveTask={handleRemoveTask}
            calculateTotal={calculateTotal}
            vehicleNumber={vehicleNumber}
          />
        </div>
        <div className="spare-parts-wrapper">
          <div className="spare-parts-input-area">
            <SparePart addSparePart={addSparePart} />
          </div>
          <SparePartsTable spareParts={spareParts} removeSparePart={removeSparePart} calculateSparePartsTotal={calculateSparePartsTotal} setSpareParts={setSpareParts} />
        </div>
      </div>
    </div>
  );
};

const ServiceHub = ({ service, onSave, onBack }) => {
  const initialState = {
    workshopService: WorkshopService.fromJson(JSON.stringify(service)),
    filter: 'all',
    categoryBadges: initializeCategoryBadges(tasksData, service.serviceTasks || []),
    activeView: 'entry',
  };

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_WORKSHOP_SERVICE':
        return { ...state, workshopService: action.payload };
      case 'SET_VEHICLE_NUMBER':
        return { ...state, workshopService: state.workshopService.setVehicleNumber(action.payload) };
      case 'SET_SERVICE_TASKS':
        return { ...state, workshopService: state.workshopService.setServiceTasks(action.payload) };
      case 'SET_SPARE_PARTS':
        return { ...state, workshopService: state.workshopService.setSpareParts(action.payload) };
      case 'SET_FILTER':
        return { ...state, filter: action.payload };
      case 'SET_CATEGORY_BADGES':
        return { ...state, categoryBadges: action.payload };
      case 'SET_ACTIVE_VIEW':
        return { ...state, activeView: action.payload };
      default:
        return state;
    }
  }, initialState);

  const { workshopService, filter, categoryBadges, activeView } = state;

  useEffect(() => {
    dispatch({
      type: 'SET_CATEGORY_BADGES',
      payload: initializeCategoryBadges(tasksData, workshopService.serviceTasks),
    });
  }, [workshopService.serviceTasks]);

  const setFilter = (newFilter) => dispatch({ type: 'SET_FILTER', payload: newFilter });
  const setActiveView = (view) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  const handleTaskClick = (task) => {
    if (!workshopService.serviceTasks.some(t => t.name === task.name)) {
      const newService = workshopService.addTask(task);
      dispatch({ type: 'SET_WORKSHOP_SERVICE', payload: newService });
    }
  };
  const handleRemoveTask = (taskName) => {
    const newService = workshopService.removeTask(taskName);
    dispatch({ type: 'SET_WORKSHOP_SERVICE', payload: newService });
  };
  const handleQuantityChange = (taskName, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    const newTasks = workshopService.serviceTasks.map(task =>
      task.name === taskName ? { ...task, quantity } : task
    );
    dispatch({ type: 'SET_SERVICE_TASKS', payload: newTasks });
  };
  const handleRemarksChange = (taskName, newRemarks) => {
    const newTasks = workshopService.serviceTasks.map(task =>
      task.name === taskName ? { ...task, remarks: newRemarks } : task
    );
    dispatch({ type: 'SET_SERVICE_TASKS', payload: newTasks });
  };
  const addSparePart = (part) => {
    const newService = workshopService.addSparePart(part);
    dispatch({ type: 'SET_WORKSHOP_SERVICE', payload: newService });
  };
  const removeSparePart = (name) => {
    const newService = workshopService.removeSparePart(name);
    dispatch({ type: 'SET_WORKSHOP_SERVICE', payload: newService });
  };
  const setServiceTasks = (tasks) => {
    dispatch({ type: 'SET_SERVICE_TASKS', payload: tasks });
  };
  const setSpareParts = (parts) => {
    dispatch({ type: 'SET_SPARE_PARTS', payload: parts });
  };

  const contextValue = {
    workshopService,
    serviceTasks: workshopService.serviceTasks,
    vehicleNumber: workshopService.vehicleNumber,
    filter,
    categoryBadges,
    spareParts: workshopService.spareParts,
    setServiceTasks,
    setVehicleNumber: (number) => {
      const newService = workshopService.setVehicleNumber(number);
      dispatch({ type: 'SET_WORKSHOP_SERVICE', payload: newService });
    },
    setFilter,
    setActiveView,
    handleTaskClick,
    handleRemoveTask,
    handleQuantityChange,
    handleRemarksChange,
    calculateTotal: () => workshopService.calculateTotal(),
    setSpareParts,
    addSparePart,
    removeSparePart,
    calculateSparePartsTotal: () => workshopService.calculateSparePartsTotal(),
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {activeView === 'entry' ? (
        <ServiceEntry onSave={onSave} onBack={onBack} />
      ) : (
        <PartsHub onSave={onSave} onBack={onBack} />
      )}
    </ServiceContext.Provider>
  );
};

const ServiceList = ({ services, onEdit, onAdd }) => (
  <div className="app-container">
    <button className="service-list-add-button" onClick={onAdd}>
      Add New
    </button>
    <h2 className="service-list-title">Workshop Services</h2>
    <table className="tasks-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Vehicle No</th>
          <th>Tasks</th>
          <th>Spare Parts</th>
          <th>Total</th>
          <th>Created Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {services.map(service => (
          <tr key={service.id}>
            <td>{service.id}</td>
            <td>{service.vehicleNumber || 'Not specified'}</td>
            <td>${service.calculateTotal()}</td>
            <td>${service.calculateSparePartsTotal()}</td>
            <td>${(parseFloat(service.calculateTotal()) + parseFloat(service.calculateSparePartsTotal())).toFixed(2)}</td>
            <td>{new Date(service.createdDate).toLocaleDateString()}</td>
            <td>
              <button className="service-list-edit-button" onClick={() => onEdit(service.id)}>
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const App = () => {
  const [services, setServices] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentServiceId, setCurrentServiceId] = useState(null);

  const handleAddService = () => {
    const newService = WorkshopService.fromJson('{}');
    setServices([...services, newService]);
    setCurrentServiceId(newService.id);
    setViewMode('entry');
  };

  const handleEditService = (id) => {
    setCurrentServiceId(id);
    setViewMode('entry');
  };

  const handleSaveService = (updatedServiceJson) => {
    const updatedService = WorkshopService.fromJson(JSON.stringify(updatedServiceJson));
    setServices(services.map(s => (s.id === updatedService.id ? updatedService : s)));
    setViewMode('list');
    setCurrentServiceId(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentServiceId(null);
  };

  const currentService = services.find(s => s.id === currentServiceId) || {};

  return (
    <>
      {viewMode === 'list' ? (
        <ServiceList services={services} onEdit={handleEditService} onAdd={handleAddService} />
      ) : (
        <ServiceHub service={currentService} onSave={handleSaveService} onBack={handleBackToList} />
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);