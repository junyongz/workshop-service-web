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

// Utility function to initialize category badges dynamically
const initializeCategoryBadges = (tasksData, selectedTasks) => {
  const parts = Object.keys(tasksData || {});
  const initialBadges = {};
  parts.forEach(part => {
    initialBadges[part] = selectedTasks.filter(t => t.part === part).length;
  });
  return initialBadges;
};

// Create Context
const ServiceContext = createContext();

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

const Category = ({ part, filter, selectedTasks, onTaskClick, onRemoveTask, categoryBadges }) => (
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
          isSelected={selectedTasks.some(t => t.name === task.name)}
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

const TableView = ({ selectedTasks, onQuantityChange, onRemoveTask, calculateTotal, vehicleNumber }) => (
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
          {selectedTasks.map((task, index) => (
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

const Sidebar = ({ vehicleNumber, selectedTasks, onVehicleChange, onRemoveTask, onQuantityChange, onRemarksChange, calculateTotal, spareParts, calculateSparePartsTotal }) => (
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
        {selectedTasks.map((task, index) => (
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
              placeholder="Spare part name (autocomplete soon)"
              className="quantity-input"
            />
            <input
              type="number"
              min="1"
              value={sparePartQuantity}
              onChange={(e) => setSparePartQuantity(parseInt(e.target.value) || 1)}
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

  const SparePartsTable = ({ spareParts, removeSparePart, calculateSparePartsTotal }) => (
    <div className="spare-parts-table-section">
      <table className="spare-parts-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {spareParts.map((spare, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{spare.name}</td>
              <td>{spare.quantity}</td>
              <td>${spare.unitPrice.toFixed(2)}</td>
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
            <td colSpan="1">Total:</td> {/* Moved to "No." column */}
            <td></td> {/* Empty "Name" column */}
            <td></td> {/* Empty "Quantity" column */}
            <td>${calculateSparePartsTotal()}</td> {/* Moved to "Unit Price" column */}
            <td></td> {/* Empty "Actions" column */}
          </tr>
        </tfoot>
      </table>
    </div>
  );

  const ServiceEntry = ({ onSave, onBack }) => {
    const { filter, selectedTasks, spareParts, vehicleNumber, categoryBadges, setFilter, setSelectedTasks, setActiveView, handleTaskClick, handleRemoveTask, calculateTotal, setVehicleNumber, calculateSparePartsTotal } = useContext(ServiceContext);
  
    const handleQuantityChange = (taskName, newQuantity) => {
      const quantity = parseInt(newQuantity) || 1;
      setSelectedTasks(selectedTasks.map(task =>
        task.name === taskName ? { ...task, quantity } : task
      ));
    };
  
    const handleRemarksChange = (taskName, newRemarks) => {
      setSelectedTasks(selectedTasks.map(task =>
        task.name === taskName ? { ...task, remarks: newRemarks } : task
      ));
    };
  
    const handleSave = () => {
      onSave({ vehicleNumber, selectedTasks });
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
            <button className="button-secondary" onClick={handleSave}>
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
                selectedTasks={selectedTasks}
                onTaskClick={handleTaskClick}
                onRemoveTask={handleRemoveTask}
                categoryBadges={categoryBadges}
              />
            ))}
          </div>
          <Sidebar
            vehicleNumber={vehicleNumber}
            selectedTasks={selectedTasks}
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

  const PartsHub = ({ onBack }) => {
    const { selectedTasks, vehicleNumber, setActiveView, handleQuantityChange, handleRemoveTask, calculateTotal, spareParts, addSparePart, removeSparePart, calculateSparePartsTotal } = useContext(ServiceContext);
  
    return (
      <div className="app-container">
        <div className="service-entry-header">
          <div className="filter-section">
            {/* Placeholder for filter buttons to maintain layout consistency, but no functionality here */}
            {getTaskTypes().map(type => (
              <button
                key={type}
                className={`filter-btn ${false ? 'active' : ''}`} /* No active state or click handlers */
                disabled
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
              </button>
            ))}
          </div>
          <div className="service-entry-actions">
            <button className="button-primary" onClick={() => setActiveView('entry')}>
              Workmanship Panel
            </button>
            <button className="button-secondary" onClick={onBack}>
              Save & Back
            </button>
          </div>
        </div>
        <div className="parts-hub-layout">
          <div className="table-view-wrapper">
            <TableView
              selectedTasks={selectedTasks}
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
            <SparePartsTable spareParts={spareParts} removeSparePart={removeSparePart} calculateSparePartsTotal={calculateSparePartsTotal} />
          </div>
        </div>
      </div>
    );
  };

const ServiceHub = ({ service, onSave, onBack }) => {
    const initialState = {
      selectedTasks: service.selectedTasks || [],
      vehicleNumber: service.vehicleNumber || '',
      filter: 'all',
      categoryBadges: initializeCategoryBadges(tasksData, service.selectedTasks || []),
      activeView: 'entry',
      spareParts: service.spareParts || [],
    };
  
    const [state, dispatch] = useReducer((state, action) => {
      switch (action.type) {
        case 'SET_SELECTED_TASKS':
          return { ...state, selectedTasks: action.payload };
        case 'SET_VEHICLE_NUMBER':
          return { ...state, vehicleNumber: action.payload };
        case 'SET_FILTER':
          return { ...state, filter: action.payload };
        case 'SET_CATEGORY_BADGES':
          return { ...state, categoryBadges: action.payload };
        case 'SET_ACTIVE_VIEW':
          return { ...state, activeView: action.payload };
        case 'SET_SPARE_PARTS':
          return { ...state, spareParts: action.payload };
        case 'ADD_SPARE_PART':
          return { ...state, spareParts: [...state.spareParts, action.payload] };
        case 'REMOVE_SPARE_PART':
          return { ...state, spareParts: state.spareParts.filter(sp => sp.name !== action.payload) };
        default:
          return state;
      }
    }, initialState);
  
    const { selectedTasks, vehicleNumber, filter, categoryBadges, activeView, spareParts } = state;
  
    useEffect(() => {
      dispatch({ type: 'SET_CATEGORY_BADGES', payload: initializeCategoryBadges(tasksData, selectedTasks) });
    }, [selectedTasks]);
  
    const setSelectedTasks = (tasks) => dispatch({ type: 'SET_SELECTED_TASKS', payload: tasks });
    const setVehicleNumber = (number) => dispatch({ type: 'SET_VEHICLE_NUMBER', payload: number });
    const setFilter = (newFilter) => dispatch({ type: 'SET_FILTER', payload: newFilter });
    const setActiveView = (view) => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    const setSpareParts = (parts) => dispatch({ type: 'SET_SPARE_PARTS', payload: parts });
    const addSparePart = (part) => dispatch({ type: 'ADD_SPARE_PART', payload: part });
    const removeSparePart = (name) => dispatch({ type: 'REMOVE_SPARE_PART', payload: name });
    const handleTaskClick = (task) => {
      if (!selectedTasks.some(t => t.name === task.name)) {
        setSelectedTasks([...selectedTasks, { ...task, quantity: 1, remarks: '' }]);
        updateCategoryBadges(task.part, 1);
      }
    };
    const handleRemoveTask = (taskName) => {
      setSelectedTasks(selectedTasks.filter(task => task.name !== taskName));
      updateCategoryBadges(getTaskPart(taskName), -1);
    };
    const handleQuantityChange = (taskName, newQuantity) => {
      const quantity = parseInt(newQuantity) || 1;
      setSelectedTasks(selectedTasks.map(task =>
        task.name === taskName ? { ...task, quantity } : task
      ));
    };
    const handleRemarksChange = (taskName, newRemarks) => {
      setSelectedTasks(selectedTasks.map(task =>
        task.name === taskName ? { ...task, remarks: newRemarks } : task
      ));
    };
    const updateCategoryBadges = (part, change) => {
      dispatch({ type: 'SET_CATEGORY_BADGES', payload: {
        ...categoryBadges,
        [part]: Math.max(0, (categoryBadges[part] || 0) + change),
      } });
    };
    const getTaskPart = (taskName) => {
      for (const part in tasksData) {
        if (tasksData[part].some(task => task.name === taskName)) return part;
      }
      return null;
    };
    const calculateTotal = () => selectedTasks.reduce((sum, task) => sum + task.price * task.quantity, 0).toFixed(2);
    const calculateSparePartsTotal = () => spareParts.reduce((sum, sp) => sum + sp.unitPrice * sp.quantity, 0).toFixed(2);
  
    const contextValue = {
      selectedTasks, vehicleNumber, filter, categoryBadges, spareParts,
      setSelectedTasks, setVehicleNumber, setFilter, setActiveView, handleTaskClick,
      handleRemoveTask, handleQuantityChange, handleRemarksChange, calculateTotal,
      setSpareParts, addSparePart, removeSparePart, calculateSparePartsTotal,
    };
  
    return (
      <ServiceContext.Provider value={contextValue}>
        {activeView === 'entry' ? (
          <ServiceEntry onSave={() => onSave({ ...service, vehicleNumber, selectedTasks, spareParts })} onBack={onBack} />
        ) : (
          <PartsHub onBack={onBack} />
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
              <td>${service.selectedTasks.reduce((sum, task) => sum + (task.price * (task.quantity || 1)), 0).toFixed(2)}</td>
              <td>${service.spareParts.reduce((sum, part) => sum + (part.unitPrice * part.quantity), 0).toFixed(2)}</td>
              <td>${(service.selectedTasks.reduce((sum, task) => sum + (task.price * (task.quantity || 1)), 0) + service.spareParts.reduce((sum, part) => sum + (part.unitPrice * part.quantity), 0)).toFixed(2)}</td>
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
    const newService = {
      id: Date.now(),
      vehicleNumber: '',
      selectedTasks: [],
      createdDate: new Date().toISOString(),
      spareParts: [],
    };
    setServices([...services, newService]);
    setCurrentServiceId(newService.id);
    setViewMode('entry');
  };

  const handleEditService = (id) => {
    setCurrentServiceId(id);
    setViewMode('entry');
  };

  const handleSaveService = (updatedService) => {
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