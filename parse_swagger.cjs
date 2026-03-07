const fs = require('fs');
const swagger = JSON.parse(fs.readFileSync('swaggerv1.json', 'utf-8'));

const summary = [];
summary.push('# Swagger API Summary');
summary.push('');

summary.push('## Endpoints');
for (const [path, methods] of Object.entries(swagger.paths)) {
    for (const [method, details] of Object.entries(methods)) {
        let params = (details.parameters || [])
            .filter(p => p.name !== 'X-Api-Version' && p.name !== 'api-version')
            .map(p => `${p.name} (${p.in})`).join(', ');

        let reqBody = '';
        if (details.requestBody && details.requestBody.content) {
            const schema = details.requestBody.content['application/json']?.schema;
            if (schema && schema.$ref) {
                reqBody = ` Body: ${schema.$ref.split('/').pop()}`;
            } else if (schema && schema.type === 'array' && schema.items.$ref) {
                reqBody = ` Body: Array of ${schema.items.$ref.split('/').pop()}`;
            }
        }

        let resType = '';
        if (details.responses && details.responses['200'] && details.responses['200'].content) {
            const schema = details.responses['200'].content['application/json']?.schema || details.responses['200'].content['text/plain']?.schema;
            if (schema && schema.$ref) {
                resType = ` -> ${schema.$ref.split('/').pop()}`;
            }
        }

        summary.push(`- **${method.toUpperCase()}** \`${path}\` ${params ? `| Params: ${params}` : ''}${reqBody}${resType}`);
    }
}

summary.push('');
summary.push('## Models');
for (const [name, schema] of Object.entries(swagger.components.schemas || {})) {
    summary.push(`### ${name}`);
    if (schema.properties) {
        for (const [propName, propDetails] of Object.entries(schema.properties)) {
            let type = propDetails.type;
            if (propDetails.$ref) type = propDetails.$ref.split('/').pop();
            if (propDetails.type === 'array') {
                type = `Array<${propDetails.items.$ref ? propDetails.items.$ref.split('/').pop() : propDetails.items.type}>`;
            }
            summary.push(`- \`${propName}\`: ${type}${propDetails.nullable ? ' (nullable)' : ''}`);
        }
    } else if (schema.enum) {
        summary.push(`Enum: ${schema.enum.join(', ')}`);
    } else {
        summary.push(`Type: ${schema.type}`);
    }
    summary.push('');
}

fs.writeFileSync('/tmp/swagger_summary.md', summary.join('\n'));
console.log('Done parsing to /tmp/swagger_summary.md');
