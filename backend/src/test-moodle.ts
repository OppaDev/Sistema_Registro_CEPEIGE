// Archivo temporal para probar Moodle
import { testMoodleConnection, moodleGet } from '@/config/moodleClient';
import { logger } from '@/utils/logger';

async function testMoodle() {
    try {
        logger.info('🔍 Probando conectividad básica...');
        
        // Test 1: Conectividad básica
        const isConnected = await testMoodleConnection();
        if (!isConnected) {
            logger.error('❌ No se puede conectar con Moodle');
            return;
        }

        // Test 2: Información del sitio
        logger.info('📋 Obteniendo información del sitio...');
        const siteInfo = await moodleGet('core_webservice_get_site_info');
        logger.info('✅ Información del sitio:', siteInfo);

        // Test 3: Probar acceso a cursos (solo lectura)
        logger.info('📚 Probando acceso a cursos...');
        try {
            const courses = await moodleGet('core_course_get_courses');
            logger.info('✅ Acceso a cursos exitoso, total:', Array.isArray(courses) ? courses.length : 'N/A');
        } catch (error) {
            logger.warn('⚠️ No se pudo acceder a cursos:', error);
        }

    } catch (error) {
        logger.error('❌ Error en prueba de Moodle:', error);
    }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
    testMoodle();
}