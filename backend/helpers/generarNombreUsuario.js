const generarNombreUsuario = () => {
  const temp = "temp-";
  const random = Math.random().toString(32).substring(2);
  return temp + random;
};

export default generarNombreUsuario;
