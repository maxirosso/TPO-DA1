export const validarCorreo = (correo) => {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correo || typeof correo !== 'string') {
    return { valido: false, mensaje: 'El correo electrónico es obligatorio.' };
  }
  if (!regexCorreo.test(correo)) {
    return { valido: false, mensaje: 'El formato del correo electrónico no es válido.' };
  }
  return { valido: true };
};


export const validarContrasena = (contrasena) => {
  if (!contrasena || typeof contrasena !== 'string') {
    return { valido: false, mensaje: 'La contraseña es obligatoria.' };
  }
  if (contrasena.length < 6) {
    return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  return { valido: true };
};

export const validarNombreUsuario = (nombreUsuario) => {
  if (!nombreUsuario || typeof nombreUsuario !== 'string') {
    return { valido: false, mensaje: 'El nombre de usuario es obligatorio.' };
  }
  const nombreLimpio = nombreUsuario.trim();
  if (nombreLimpio.length < 3) {
    return { valido: false, mensaje: 'El nombre de usuario debe tener al menos 3 caracteres.' };
  }
  if (nombreLimpio.length > 30) {
    return { valido: false, mensaje: 'El nombre de usuario no puede tener más de 30 caracteres.' };
  }
  const regexNombreUsuario = /^[a-zA-Z0-9_]+$/;
  if (!regexNombreUsuario.test(nombreLimpio)) {
    return { valido: false, mensaje: 'El nombre de usuario solo puede contener letras, números y guiones bajos.' };
  }
  return { valido: true };
};

export const validarNumeroTarjeta = (numeroTarjeta) => {
  if (!numeroTarjeta || typeof numeroTarjeta !== 'string') {
    return { valido: false, mensaje: 'El número de tarjeta es obligatorio.' };
  }
  
 
  const numeroLimpio = numeroTarjeta.replace(/[\s-]/g, '');
  

  if (!/^\d+$/.test(numeroLimpio)) {
    return { valido: false, mensaje: 'El número de tarjeta solo puede contener números.' };
  }
  
  if (numeroLimpio.length < 13 || numeroLimpio.length > 19) {
    return { valido: false, mensaje: 'El número de tarjeta debe tener entre 13 y 19 dígitos.' };
  }
  
  return { valido: true };
};

export const validarFechaVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento || typeof fechaVencimiento !== 'string') {
    return { valido: false, mensaje: 'La fecha de vencimiento es obligatoria.' };
  }
  
  const regexFecha = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regexFecha.test(fechaVencimiento)) {
    return { valido: false, mensaje: 'La fecha de vencimiento debe tener el formato MM/YY.' };
  }
  
  const [mes, ano] = fechaVencimiento.split('/');
  const anoCompleto = 2000 + parseInt(ano, 10);
  const fechaVencimientoCompleta = new Date(anoCompleto, parseInt(mes, 10) - 1);
  const fechaActual = new Date();
  
  if (fechaVencimientoCompleta < fechaActual) {
    return { valido: false, mensaje: 'La tarjeta ha expirado.' };
  }
  
  return { valido: true };
};

export const validarCVV = (cvv) => {
  if (!cvv || typeof cvv !== 'string') {
    return { valido: false, mensaje: 'El código de seguridad es obligatorio.' };
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    return { valido: false, mensaje: 'El código de seguridad debe tener 3 o 4 dígitos.' };
  }
  
  return { valido: true };
};

export const validarNumeroTramite = (numeroTramite) => {
  if (!numeroTramite || typeof numeroTramite !== 'string') {
    return { valido: false, mensaje: 'El número de trámite es obligatorio.' };
  }
  
  const numeroLimpio = numeroTramite.trim().toUpperCase();
  
  const regexTramite = /^[A-Z]{1,2}\d{4,8}$/;
  if (!regexTramite.test(numeroLimpio)) {
    return { valido: false, mensaje: 'El número de trámite debe tener el formato correcto (ej: AB123456).' };
  }
  
  return { valido: true };
};

export const validarDatosRegistroEstudiante = (datos) => {
  const errores = [];
  
  const validacionCorreo = validarCorreo(datos.correo);
  if (!validacionCorreo.valido) {
    errores.push(validacionCorreo.mensaje);
  }
  
  const validacionTarjeta = validarNumeroTarjeta(datos.numeroTarjeta);
  if (!validacionTarjeta.valido) {
    errores.push(validacionTarjeta.mensaje);
  }
  
  const validacionFecha = validarFechaVencimiento(datos.fechaVencimiento);
  if (!validacionFecha.valido) {
    errores.push(validacionFecha.mensaje);
  }
  
  const validacionCVV = validarCVV(datos.cvv);
  if (!validacionCVV.valido) {
    errores.push(validacionCVV.mensaje);
  }
  
  // Validar nombre en tarjeta
  if (!datos.nombreTarjeta || datos.nombreTarjeta.trim().length < 2) {
    errores.push('El nombre en la tarjeta debe tener al menos 2 caracteres.');
  }
  
  // Validar número de trámite
  const validacionTramite = validarNumeroTramite(datos.tramite);
  if (!validacionTramite.valido) {
    errores.push(validacionTramite.mensaje);
  }
  
  // Validar que las imágenes del DNI estén presentes
  if (!datos.dniFrente) {
    errores.push('La foto del frente del DNI es obligatoria.');
  }
  
  if (!datos.dniReverso) {
    errores.push('La foto del reverso del DNI es obligatoria.');
  }
  
  return {
    valido: errores.length === 0,
    errores: errores
  };
};

export const validarDatosRegistroUsuario = (datos) => {
  const errores = [];
  
  // Validar correo
  const validacionCorreo = validarCorreo(datos.email);
  if (!validacionCorreo.valido) {
    errores.push(validacionCorreo.mensaje);
  }
  
  // Validar contraseña solo si está presente (para usuarios regulares/alumnos puede ser null)
  if (datos.password !== null && datos.password !== undefined) {
    const validacionContrasena = validarContrasena(datos.password);
    if (!validacionContrasena.valido) {
      errores.push(validacionContrasena.mensaje);
    }
  }
  
  // Validar nombre de usuario
  const validacionNombreUsuario = validarNombreUsuario(datos.username);
  if (!validacionNombreUsuario.valido) {
    errores.push(validacionNombreUsuario.mensaje);
  }
  
  // Validar nombre (opcional pero si está presente debe ser válido)
  if (datos.name && datos.name.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres.');
  }
  
  return {
    valido: errores.length === 0,
    errores: errores
  };
}; 