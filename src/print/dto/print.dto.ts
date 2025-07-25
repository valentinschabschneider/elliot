import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PrintOutputType } from '../../whatever/print-output-type.enum';

function parseCookieString(cookieStr: string) {
  const parts = cookieStr.split(';').map((part) => part.trim());
  const cookieObj = {};

  for (const part of parts) {
    const [key, ...valParts] = part.split('=');
    const value = valParts.length > 0 ? valParts.join('=') : true; // flags like Secure
    cookieObj[key] = value;
  }

  return cookieObj;
}

export class CookieDto {
  constructor(cookieString?: string) {
    if (cookieString) {
      const parsed = CookieDto.parse(cookieString);
      Object.assign(this, parsed);
    }
  }

  private static parse(cookieStr: string): Partial<CookieDto> {
    const parts = cookieStr.split(';').map((p) => p.trim());
    const first = parts.shift();
    const [name, ...valueParts] = first?.split('=') ?? [];
    const parsed: Partial<CookieDto> = {
      name,
      value: valueParts.join('='),
    };

    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      const value = valueParts.length ? valueParts.join('=') : true;

      switch (key.toLowerCase()) {
        case 'path':
          parsed.path = value as string;
          break;
        case 'domain':
          parsed.domain = value as string;
          break;
        case 'expires':
          parsed.expires = new Date(value as string);
          break;
        case 'max-age':
          parsed.maxAge = Number(value);
          break;
        case 'secure':
          parsed.secure = true;
          break;
        case 'httponly':
          parsed.httpOnly = true;
          break;
        case 'samesite':
          parsed.sameSite = value as 'Strict' | 'Lax' | 'None';
          break;
      }
    }

    return parsed;
  }

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Cookie name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Cookie value' })
  value?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Cookie path' })
  path?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Cookie domain' })
  domain?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value instanceof Date ? value : new Date(value)))
  @ApiPropertyOptional({ description: 'Expiration date of the cookie' })
  expires?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiPropertyOptional({ description: 'Max-Age in seconds' })
  maxAge?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiPropertyOptional({ description: 'Indicates if the cookie is secure' })
  secure?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  @ApiPropertyOptional({ description: 'Indicates if the cookie is HttpOnly' })
  httpOnly?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'SameSite policy',
    enum: ['Strict', 'Lax', 'None'],
  })
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export class PrintDto {
  @ApiProperty({
    description: 'Type of the output.',
    required: true,
  })
  outputType: PrintOutputType;
  @ApiProperty({
    description: 'Url of the page to be printed.',
    required: false,
  })
  @IsOptional()
  url?: string;
  @IsArray()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value === undefined ? [] : [value],
  )
  @IsOptional()
  @Expose({ name: 'additionalScript' })
  @ApiPropertyOptional({
    description: 'Additional scripts to load.',
    default: [],
  })
  additionalScripts?: string[];
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'Timeout in milliseconds.',
    default: undefined,
  })
  timeout?: number;
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inject the polyfill script.',
    default: true,
  })
  injectPolyfill: boolean = true;
  @IsArray()
  @Transform(({ value }) => {
    const headers: string[] = Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value];

    return headers.reduce((acc, header) => {
      const [name, ...value] = header.split(':');
      return [...acc, { [name]: value.join(':') }];
    }, []);
  })
  @IsOptional()
  @Expose({ name: 'httpHeader' })
  @ApiPropertyOptional({
    description: 'HTTP header to pass through.',
    default: [],
  })
  httpHeaders?: Record<string, string>[];
  @IsArray()
  @Transform(({ value }) => {
    const cookieStrings = Array.isArray(value)
      ? value
      : value === undefined
        ? []
        : [value];

    return cookieStrings.map((cookieStr) => new CookieDto(cookieStr));
  })
  @IsOptional()
  @Expose({ name: 'cookie' })
  @ApiPropertyOptional({
    description: 'Cookies to pass through.',
    default: [],
  })
  cookies?: CookieDto[];
}
