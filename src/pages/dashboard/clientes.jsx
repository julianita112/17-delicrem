import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
} from "@material-tailwind/react";
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState({
    id_cliente: "",
    nombre: "",
    contacto: "",
    createdAt: "",
    updatedAt: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(3); // Cambiar a 3 para mantener consistencia con Usuarios
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/clientes");
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  useEffect(() => {
    const filtered = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [search, clientes]);

  const handleOpen = () => {
    setOpen(!open);
    setFormErrors({});
  };

  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedCliente({
      id_cliente: "",
      nombre: "",
      contacto: "",
      createdAt: "",
      updatedAt: ""
    });
    setEditMode(false);
    handleOpen();
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setEditMode(true);
    handleOpen();
    setFormErrors({});
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'btnagregar',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/clientes/${id}`);
        fetchClientes();
        Toast.fire({
          icon: 'success',
          title: '¡Eliminado! El cliente ha sido eliminado.'
        });
      } catch (error) {
        console.error("Error deleting cliente:", error);
        Toast.fire({
          icon: 'error',
          title: 'Error al eliminar cliente. Por favor, inténtalo de nuevo.'
        });
      }
    }
  };

  const handleSave = async () => {
    if (!validateFields(selectedCliente)) {
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/clientes/${selectedCliente.id_cliente}`, selectedCliente);
        fetchClientes();
        Toast.fire({
          icon: 'success',
          title: '¡Actualizado! El cliente ha sido actualizado correctamente.'
        });
      } else {
        await axios.post("http://localhost:3000/api/clientes", selectedCliente);
        fetchClientes();
        Toast.fire({
          icon: 'success',
          title: '¡Creado! El cliente ha sido creado correctamente.'
        });
      }
      handleOpen();
    } catch (error) {
      console.error("Error saving cliente:", error);
      Toast.fire({
        icon: 'error',
        title: 'Error al guardar cliente. Por favor, inténtalo de nuevo.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCliente({ ...selectedCliente, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (cliente) => {
    setSelectedCliente(cliente);
    handleDetailsOpen();
  };

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const validateFields = (cliente) => {
    const errors = {};

    if (!cliente.nombre || cliente.nombre.length < 3) {
      errors.nombre = 'El nombre debe contener al menos 3 letras.';
    }

    if (!cliente.contacto || cliente.contacto.length < 7) {
      errors.contacto = 'El número de teléfono debe contener al menos 7 caracteres.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" size="sm" startIcon={<PlusIcon className="h-4 w-4" />}>
            Crear Cliente
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-1">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Clientes
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-20 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de teléfono
                    </th>
                    <th scope="col" className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentClientes.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nombre}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{cliente.contacto}</td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-1">
                          <IconButton className="btnedit" size="sm" onClick={() => handleEdit(cliente)}>
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton className="cancelar" size="sm" onClick={() => handleDelete(cliente.id_cliente)}>
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton color="btnvisualizar" size="sm" onClick={() => handleViewDetails(cliente)}>
                            <EyeIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              {Array.from({ length: Math.ceil(filteredClientes.length / clientesPerPage) }, (_, i) => i + 1).map(number => (
                <Button
                  key={number}
                  className={`pagination ${currentPage === number ? "active" : ""}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="custom-modal" >
        <DialogHeader>{editMode ? "Editar Cliente" : "Crear Cliente"}</DialogHeader>
        <DialogBody className="custom-modal-body">
          <div className="flex flex-col space-y-1">
            <div className="mb-4">
              <Input
                type="text"
                name="nombre"
                label="Nombre"
                value={selectedCliente.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
            </div>
            <div className="mb-4">
              <Input
                type="text"
                name="contacto"
                label="Número de teléfono"
                value={selectedCliente.contacto}
                onChange={handleChange}
                error={!!formErrors.contacto}
                helperText={formErrors.contacto}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button className="btnguardar" onClick={handleSave}>
            Guardar
          </Button>
          <Button className="btncancelar" onClick={handleOpen}>
            Cancelar
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="custom-modal">
        <DialogHeader>Detalles del Cliente</DialogHeader>
        <DialogBody>
          <Typography variant="subtitle1">
            ID: {selectedCliente.id_cliente}
          </Typography>
          <Typography variant="subtitle1">
            Nombre: {selectedCliente.nombre}
          </Typography>
          <Typography variant="subtitle1">
            Número de teléfono: {selectedCliente.contacto}
          </Typography>
          <Typography variant="subtitle1">
            Creado: {selectedCliente.createdAt}
          </Typography>
          <Typography variant="subtitle1">
            Actualizado: {selectedCliente.updatedAt}
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button className="btncerrar" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default Clientes;